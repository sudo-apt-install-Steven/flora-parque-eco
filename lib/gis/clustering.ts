import { ClusterResult, ClusteringOptions } from './types';

/**
 * Converte latitude e longitude (WGS84) para coordenadas normalizadas Web Mercator [0, 1]
 */
export function lngLatToMercator(lng: number, lat: number): [number, number] {
  const x = (lng + 180) / 360;
  const sin = Math.sin((Math.max(-85.05112878, Math.min(85.05112878, lat)) * Math.PI) / 180);
  const y = 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI);
  return [x, y];
}

/**
 * Converte coordenadas Web Mercator [0, 1] de volta para latitude e longitude (WGS84)
 */
export function mercatorToLngLat(x: number, y: number): [number, number] {
  const lng = x * 360 - 180;
  const y2 = (180 - y * 360) * (Math.PI / 180);
  const lat = (360 / Math.PI) * Math.atan(Math.exp(y2)) - 90;
  return [lng, lat];
}

interface InternalNode<T> {
  id: string | number;
  isCluster: boolean;
  x: number; // Web Mercator x
  y: number; // Web Mercator y
  lng: number;
  lat: number;
  pointCount: number;
  clusterId?: number;
  item?: T;
  children?: InternalNode<T>[];
  zoom: number;
}

/**
 * Índice espacial hierárquico para agrupamento de pontos (Supercluster)
 */
export class SpatialClusterIndex<T> {
  private readonly minZoom: number;
  private readonly maxZoom: number;
  private readonly radius: number;
  private readonly extent: number;
  private readonly trees: Map<number, InternalNode<T>[]> = new Map();
  private readonly clusterRegistry: Map<number, InternalNode<T>> = new Map();
  private nextClusterId = 1;

  constructor(
    items: T[],
    getCoordinates: (item: T) => [number, number] | null,
    options: ClusteringOptions = {}
  ) {
    this.minZoom = options.minZoom ?? 0;
    this.maxZoom = options.maxZoom ?? 17;
    this.radius = options.radius ?? 45;
    this.extent = options.extent ?? 512;

    this.buildIndex(items, getCoordinates);
  }

  private buildIndex(items: T[], getCoords: (item: T) => [number, number] | null): void {
    // Nível mais detalhado (folhas)
    const baseLeaves: InternalNode<T>[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const coords = getCoords(item);
      if (!coords) continue;
      const [lng, lat] = coords;
      if (typeof lng !== 'number' || typeof lat !== 'number' || Number.isNaN(lng) || Number.isNaN(lat)) {
        continue;
      }

      const [x, y] = lngLatToMercator(lng, lat);
      baseLeaves.push({
        id: `leaf-${i}`,
        isCluster: false,
        x,
        y,
        lng,
        lat,
        pointCount: 1,
        item,
        zoom: this.maxZoom + 1
      });
    }

    let currentNodes = baseLeaves;

    // Constrói a pirâmide espacial de clusters do maxZoom até o minZoom
    for (let z = this.maxZoom; z >= this.minZoom; z--) {
      currentNodes = this.clusterAtZoom(currentNodes, z);
      this.trees.set(z, currentNodes);
    }
  }

  private clusterAtZoom(nodes: InternalNode<T>[], zoom: number): InternalNode<T>[] {
    const clustered: InternalNode<T>[] = [];
    const r = this.radius / (this.extent * Math.pow(2, zoom));
    const rSq = r * r;
    const visited = new Uint8Array(nodes.length);

    // Indexa os nós em células espaciais para busca rápida O(1) de vizinhos
    const cellSize = r;
    const grid = new Map<string, number[]>();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const gx = Math.floor(node.x / cellSize);
      const gy = Math.floor(node.y / cellSize);
      const key = `${gx}:${gy}`;
      const cell = grid.get(key);
      if (cell) {
        cell.push(i);
      } else {
        grid.set(key, [i]);
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      if (visited[i]) continue;
      visited[i] = 1;

      const node = nodes[i];
      const neighbors: number[] = [i];

      const gx = Math.floor(node.x / cellSize);
      const gy = Math.floor(node.y / cellSize);

      // Consulta as 9 células vizinhas adjacentes
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const key = `${gx + dx}:${gy + dy}`;
          const cell = grid.get(key);
          if (!cell) continue;

          for (const j of cell) {
            if (visited[j]) continue;
            const other = nodes[j];
            const distSq = (node.x - other.x) * (node.x - other.x) + (node.y - other.y) * (node.y - other.y);
            if (distSq <= rSq) {
              neighbors.push(j);
              visited[j] = 1;
            }
          }
        }
      }

      if (neighbors.length === 1) {
        clustered.push(node);
      } else {
        const clusterId = this.nextClusterId++;
        let sumX = 0;
        let sumY = 0;
        let totalCount = 0;
        const children: InternalNode<T>[] = [];

        for (const idx of neighbors) {
          const neighbor = nodes[idx];
          sumX += neighbor.x * neighbor.pointCount;
          sumY += neighbor.y * neighbor.pointCount;
          totalCount += neighbor.pointCount;
          children.push(neighbor);
        }

        const avgX = sumX / totalCount;
        const avgY = sumY / totalCount;
        const [avgLng, avgLat] = mercatorToLngLat(avgX, avgY);

        const clusterNode: InternalNode<T> = {
          id: `cluster-${clusterId}`,
          clusterId,
          isCluster: true,
          x: avgX,
          y: avgY,
          lng: avgLng,
          lat: avgLat,
          pointCount: totalCount,
          children,
          zoom
        };

        this.clusterRegistry.set(clusterId, clusterNode);
        clustered.push(clusterNode);
      }
    }

    return clustered;
  }

  /**
   * Retorna clusters e nós folha visíveis em um determinado bounding box e zoom
   * bbox: [minLng, minLat, maxLng, maxLat] (suporta qualquer orientação)
   */
  public getClusters(bbox: [number, number, number, number], zoom: number): ClusterResult<T>[] {
    const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, Math.floor(zoom)));
    const nodes = this.trees.get(clampedZoom) ?? [];
    const minLng = Math.min(bbox[0], bbox[2]);
    const maxLng = Math.max(bbox[0], bbox[2]);
    const minLat = Math.min(bbox[1], bbox[3]);
    const maxLat = Math.max(bbox[1], bbox[3]);

    const results: ClusterResult<T>[] = [];

    for (const node of nodes) {
      if (
        node.lng >= minLng &&
        node.lng <= maxLng &&
        node.lat >= minLat &&
        node.lat <= maxLat
      ) {
        results.push({
          id: node.id,
          isCluster: node.isCluster,
          coordinates: [node.lng, node.lat],
          pointCount: node.pointCount,
          item: node.item,
          clusterId: node.clusterId
        });
      }
    }

    return results;
  }

  /**
   * Obtém o nível de zoom onde o cluster se expande / desmembra
   */
  public getClusterExpansionZoom(clusterId: number): number {
    const cluster = this.clusterRegistry.get(clusterId);
    if (!cluster) return this.maxZoom;

    let currentZoom = cluster.zoom;
    while (currentZoom <= this.maxZoom) {
      const nodes = this.trees.get(currentZoom) ?? [];
      const found = nodes.find(
        (n) =>
          n.clusterId === clusterId ||
          (n.isCluster && n.children?.some((c) => c.clusterId === clusterId))
      );
      if (!found || !found.isCluster) {
        return currentZoom;
      }
      currentZoom++;
    }

    return this.maxZoom + 1;
  }

  /**
   * Retorna todas as folhas (itens originais) pertencentes a um determinado cluster
   */
  public getClusterLeaves(clusterId: number, limit = 100, offset = 0): T[] {
    const cluster = this.clusterRegistry.get(clusterId);
    if (!cluster) return [];

    const leaves: T[] = [];
    const collectLeaves = (node: InternalNode<T>) => {
      if (!node.isCluster && node.item) {
        leaves.push(node.item);
      } else if (node.children) {
        for (const child of node.children) {
          collectLeaves(child);
        }
      }
    };

    collectLeaves(cluster);
    return leaves.slice(offset, offset + limit);
  }
}

/**
 * Cria uma instância do índice espacial de agrupamento Supercluster
 */
export function createSupercluster<T>(
  items: T[],
  getCoordinates: (item: T) => [number, number] | null,
  options?: ClusteringOptions
): SpatialClusterIndex<T> {
  return new SpatialClusterIndex<T>(items, getCoordinates, options);
}
