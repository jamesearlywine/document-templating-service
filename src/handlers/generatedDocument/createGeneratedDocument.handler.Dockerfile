FROM amazon-linux-v2-node-v18-libre-office-v7-6-2-x86-64:latest AS base

COPY index.js ${LAMBDA_TASK_ROOT}/

CMD [ "index.handler" ]