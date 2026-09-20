# UDM — GLOBAL KNOWLEDGE & SYSTEM CONVENTIONS

## Identificação do Sistema
- **Memória Central:** UDM 4.0 (`D:\Universal-Agent-Memory`)
- **Host:** Windows 11 IoT Enterprise LTSC / Xeon E5-2650 v4 / 16GB RAM / SSD NVMe 128GB + HDD 500GB (D:)
- **Agentes Participantes:** Antigravity (Lead Engineer), Claude Code, Codex, 9router, modelos futuros.

## Regras Globais de Engenharia
1. **Governança de Segredos (Fail-Closed):**
   - NUNCA gravar senhas, API keys, tokens JWT ou strings de conexão com credenciais no repositório ou no client-side.
   - Qualquer dado sensível deve ser mascarado como `[REDACTED:TOKEN]`.
2. **Zero-Cost Architecture ($0 Budget):**
   - Soluções sem necessidade de servidores pagos.
   - Frontend estático/JAMstack hospedado na Vercel.
   - Mapas via MapLibre GL JS utilizando tiles abertos e camadas vetoriais próprias em GeoJSON.
3. **Rigidez Acadêmica dos Dados:**
   - Proibido inventar dados biológicos, coordenadas arbitrárias não validadas ou identificações botânicas definitivas sem conferência de campo.
   - Dados de teste devem ser expressamente marcados como `[MOCK]`.
4. **Ciclo de Trabalho Multi-Agente:**
   `READ UDM` → `WORK` → `TEST` → `WRITE UDM` → `HANDOFF`.
   Nenhum agente encerra o turno sem atualizar os 5 arquivos de estado (`CURRENT_STATE`, `TASKS`, `DECISIONS`, `CHANGELOG`, `AGENT_HANDOFF`).
