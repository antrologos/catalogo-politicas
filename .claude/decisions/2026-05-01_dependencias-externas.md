---
status: aceito
data: 2026-05-01
contexto: "Bloco D requer captura de PDFs escaneados (OCR) e documentos DOC legados. Esses formatos exigem binários externos (Tesseract OCR + LibreOffice). Decisão: instalar via winget e documentar paths para reprodutibilidade."
---

# Dependências externas: Tesseract OCR + LibreOffice

## Contexto

Bloco C deixou pendente o tratamento de:
- **PDFs escaneados** (sem texto nativo embutido) — requer OCR
- **DOC legado** (.doc do MS Word antigo, comum em portais governamentais estaduais)
- **ODT** (OpenDocument Text) — `odfpy` Python já no requirements, mas raramente usado

Soluções 100% Python para esses formatos são inadequadas:
- OCR sem Tesseract (LSTM-based engine) tem qualidade muito inferior
- DOC legado só é parseável com binders ao MS Word ou LibreOffice

Decisão: aceitar dependência de ferramentas nativas do SO + documentar instalação.

## Alternativas consideradas

1. **Pular OCR + DOC, marcar formatos não suportados** — Bloco D sai mais leve mas catálogo perde conteúdo de PDFs escaneados (que existem em portais antigos)
2. **Usar Cloud OCR (Google Vision API, AWS Textract)** — boa qualidade mas custos + dependência de credenciais + latência de rede + LGPD (envio de conteúdo a 3rd party)
3. **Instalar Tesseract + LibreOffice via winget** ✅ ESCOLHIDO — pacote oficial Microsoft Store; reproducible; sem custo recorrente; offline; 100% local

## Decisão

Instalar:
- **Tesseract OCR 5.4.0** (`UB-Mannheim.TesseractOCR`) com idioma português
- **LibreOffice 26.2.2** (`TheDocumentFoundation.LibreOffice`)

Idioma português do Tesseract NÃO vem com o instalador padrão; baixado manualmente:
- `por.traineddata` de `tessdata_fast` (https://github.com/tesseract-ocr/tessdata_fast)
- Salvo em `data/external_tools/tessdata/por.traineddata` (~2 MB)
- Apontado via env var `TESSDATA_PREFIX` quando rodar OCR

## Comando de instalação (documentado para reprodutibilidade)

```powershell
winget install -e --id UB-Mannheim.TesseractOCR --accept-source-agreements --accept-package-agreements
winget install -e --id TheDocumentFoundation.LibreOffice --accept-source-agreements --accept-package-agreements
```

E para o idioma:
```bash
mkdir -p "$REPO/data/external_tools/tessdata"
curl -L -o "$REPO/data/external_tools/tessdata/por.traineddata" \
  "https://github.com/tesseract-ocr/tessdata_fast/raw/main/por.traineddata"
```

## Paths default Windows

- Tesseract: `C:\Program Files\Tesseract-OCR\tesseract.exe`
- LibreOffice: `C:\Program Files\LibreOffice\program\soffice.exe`

Configuráveis via env vars (`TESSERACT_BIN`, `SOFFICE_BIN`, `TESSDATA_PREFIX`) em `scripts/captura/_external_tools.py`.

## Justificativa

- **Reproducibilidade**: `winget` é o gerenciador oficial Windows; comandos são auditáveis
- **Custo zero**: tudo open source
- **Offline**: catálogo não depende de serviços externos para captura
- **LGPD**: nenhum dado sai do ambiente local
- **Qualidade**: Tesseract LSTM com `tessdata_fast` é bom para texto bem digitalizado (corpus governamental); pode-se trocar para `tessdata_best` se qualidade for problema

## Trade-offs

- **Footprint**: ~400 MB (Tesseract 50 MB + LibreOffice 350 MB)
- **Não cross-platform automaticamente** — Linux/Mac precisariam paths diferentes; helper `_external_tools.py` lida com isso via `shutil.which()` + env vars
- **OCR é lento**: 10-30s por página de PDF escaneado; aceitável para corpus pequeno (<10 PDFs estimados)
- **LibreOffice headless não retorna `--version`** em modo CLI direto (tenta abrir janela); detectar via `Path.is_file()` é suficiente

## Reflexos no código

- Novo helper: `scripts/captura/_external_tools.py` (paths configuráveis + health-check)
- `scripts/captura/capturar_norma.py` v2.0 usa `tesseract_bin()`, `soffice_bin()`, `tessdata_prefix()`
- Testes OCR/DOC marcados com `@pytest.mark.skipif(not has_tesseract_pt(), ...)` para CI sem essas tools

## Próximos passos

1. ✅ winget install Tesseract + LibreOffice (FEITO 2026-05-01)
2. ✅ Download `por.traineddata` (FEITO)
3. ✅ Helper `_external_tools.py` criado (FEITO)
4. Implementar OCR fallback em `capturar_norma.py` (D.1)
5. Implementar DOC fallback via subprocess soffice (D.1)
6. Testes unit `test_ocr_pdf_escaneado` e `test_doc_para_txt` (D.6)

## Relacionado

- `.claude/plans/2026-05-01_bloco-d-captura-integral.md` (plano D)
- `.claude/rules/captura-responsavel.md` v1.0 (R5/R7 — snapshot + validação)
- `.claude/skills/capturar-norma/SKILL.md` v1.0 → v2.0