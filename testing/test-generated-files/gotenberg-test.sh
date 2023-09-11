#!/usr/bin/env bash
curl --request POST 'http://localhost:3000/forms/libreoffice/convert' \
--form 'files=@"/Users/jearlywine/dev/processproof/document-templating-service/testing/test-generated-files/output--dfb7b030-7272-4e8d-9977-82ad2859ac5f.docx"' \
--form 'nativePdfFormat="PDF/A-1a"' \
-o output--dfb7b030-7272-4e8d-9977-82ad2859ac5f.pdf
