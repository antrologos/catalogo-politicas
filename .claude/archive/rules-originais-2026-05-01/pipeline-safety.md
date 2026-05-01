---
paths:
  - "transcribe_pipeline/whisperx_runner.py"
  - "transcribe_pipeline/render.py"
  - "transcribe_pipeline/diarization.py"
  - "transcribe_pipeline/audio.py"
  - "transcribe_pipeline/manifest.py"
  - "transcribe_pipeline/qc.py"
  - "transcribe_pipeline/cli.py"
  - "transcribe_pipeline/config.py"
  - "Transcricoes/**"
---

# Regras para o pipeline de transcricao

## Seguranca de dados
- Saidas do ASR baseline em `02_asr_raw/` nao devem ser sobrescritas sem decisao explicita
- Testes A/B: gravar em `02_asr_variants/<nome>/`, nunca no baseline
- `speakers_map.csv` e override manual; rotulos de `metadados.csv` sao default
- JSON canonico e camada auditavel: nunca misturar com edicoes humanas

## Compatibilidade Dropbox
- Escrever CSV/JSON diretamente (sem rename atomico, sem .tmp)
- `encoding="utf-8"` explicito em todo I/O de texto
- `python -B` para evitar bytecode

## Processamento
- WhisperX CLI: `diarize: false` por override quando pyannote roda separado
- pyannote: gera `regular` e `exclusive`; usar `exclusive` no render
- Render: divide segmentos ASR se a diarizacao trocar de falante dentro do segmento
- Config: `project_root: .` se resolve relativo ao `run_config.yaml`, nao ao cwd
