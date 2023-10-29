FROM public.ecr.aws/lambda/nodejs:18.2023.10.24.14 AS base
# shameslessly copied/adapted from here: https://github.com/shelfio/libreoffice-lambda-base-image

# binutils is needed for "strip" command
RUN yum install \
    tar \
    gzip \
    libdbusmenu.x86_64 \
    libdbusmenu-gtk2.x86_64 \
    libSM.x86_64 \
    xorg-x11-fonts-* \
    google-noto-sans-cjk-fonts.noarch \
    binutils.x86_64 \
    libXinerama \
    java \
    cups-libs \
    -y && \
    yum clean all

RUN set -xo pipefail && \
    curl "https://mirror1.cs-georgetown.net/tdf/libreoffice/stable/7.6.2/rpm/x86_64/LibreOffice_7.6.2_Linux_x86-64_rpm.tar.gz" | tar -xz

RUN cd LibreOffice_7.6.2.1_Linux_x86-64_rpm/RPMS && \
    yum install *.rpm -y && \
    rm -rf /var/task/LibreOffice_7.6.2*

ENV HOME=/tmp

# Trigger dummy run to generate bootstrap files to improve cold start performance
RUN touch /tmp/test.txt \
    && cd /tmp \
    && libreoffice7.6 --headless --invisible --nodefault --view \
        --nolockcheck --nologo --norestore --convert-to pdf \
        --outdir /tmp /tmp/test.txt \
    && rm /tmp/test.*

COPY index.js ${LAMBDA_TASK_ROOT}/

CMD [ "index.handler" ]