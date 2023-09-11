#!/usr/bin/env bash

curl \
--request POST 'http://localhost:3000/forms/libreoffice/convert' \
--form 'files=@"/Users/jearlywine/dev/processproof/document-templating-service/testing/test-generated-files/output--b0cfb9f7-be9d-446f-84d7-f02ae8ff79b7.docx"' \
--form 'nativePdfFormat="PDF/A-1a"' \
-o output--b0cfb9f7-be9d-446f-84d7-f02ae8ff79b7.pdf