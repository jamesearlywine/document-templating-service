#!/usr/bin/env bash

curl \
--request POST 'http://localhost:3000/forms/libreoffice/convert' \
--form 'files=@"/Users/jearlywine/dev/processproof/document-templating-service/testing/test-generated-files/output--2364ca70-893f-4b8f-869b-ce01122deb62.docx"' \
--form 'nativePdfFormat="PDF/A-1a"' \
-o output--2364ca70-893f-4b8f-869b-ce01122deb62.pdf