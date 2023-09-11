#!/usr/bin/env bash
curl --request POST 'http://localhost:3000/forms/libreoffice/convert' \
--form 'files=@"/Users/jearlywine/dev/processproof/document-templating-service/testing/test-generated-files/output--c3ee7719-db96-42c0-8186-ac99498c37d2.docx"' \
--form 'nativePdfFormat="PDF/A-1a"' \
-o output--c3ee7719-db96-42c0-8186-ac99498c37d2.pdf
