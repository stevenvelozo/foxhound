# Use the codercom/code-server image
FROM codercom/code-server:latest
MAINTAINER steven velozo

VOLUME /home/coder/.config
VOLUME /home/coder/.vscode

RUN echo "...installing debian dependencies..."
RUN sudo apt update
RUN sudo apt install vim curl tmux -y

RUN echo "Building RETOLD development image..."


RUN echo "...mapping library specific volumes..."
# Volume mappings for RETOLD:Foxhound library
VOLUME /home/coder/foxhound
# VOLUME /home/coder/foxhound/node_modules

SHELL ["/bin/bash", "-c"]
USER coder

RUN echo "...installing node version manager..."
# Because there is a .bashrc chicken/egg problem, we will create one here to simulate logging in.  This is not great.
RUN touch ~/.bashrc && chmod +x ~/.bashrc
RUN curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash

RUN echo "...installing node version 14 as the default..."
RUN . ~/.nvm/nvm.sh && source ~/.bashrc && nvm install 14
RUN . ~/.nvm/nvm.sh && source ~/.bashrc && nvm alias default 14

WORKDIR /home/coder/foxhound
