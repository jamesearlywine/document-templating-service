#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

POST_GENERATED_DOCUMENT_TEST=$SCRIPT_DIR/post-generated-document.yaml
POST_GENERATED_DOCUMENT_REPORT_PATH=$SCRIPT_DIR/reports/post-generated-document$(date +%Y-%m-%d-%H.%M.%S).json
$(which artillery) run -o $POST_GENERATED_DOCUMENT_REPORT_PATH $POST_GENERATED_DOCUMENT_TEST
