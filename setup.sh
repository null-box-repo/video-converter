#!/bin/sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[1/5] Updating packages...${NC}"
apk update && echo -e "${GREEN}[1/5] Update complete${NC}"

echo -e "${BLUE}[2/5] Upgrading packages...${NC}"
apk upgrade && echo -e "${GREEN}[2/5] Upgrade complete${NC}"

echo -e "${BLUE}[3/5] Checking nodejs...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}[3/5] nodejs is already installed${NC}"
else
    echo -e "${YELLOW}[3/5] nodejs not found${NC}"
    echo -e "${BLUE}[3/5] Installing nodejs...${NC}"
    apk add nodejs && echo -e "${GREEN}[3/5] nodejs installed successfully${NC}"
fi

echo -e "${BLUE}[4/5] Checking npm...${NC}"
if command -v npm &> /dev/null; then
    echo -e "${GREEN}[4/5] npm is already installed${NC}"
else
    echo -e "${YELLOW}[4/5] npm not found${NC}"
    echo -e "${BLUE}[4/5] Installing npm...${NC}"
    apk add npm && echo -e "${GREEN}[4/5] npm installed successfully${NC}"
fi

echo -e "${BLUE}[5/5] Checking FFmpeg...${NC}"
if command -v ffmpeg &> /dev/null; then
    echo -e "${GREEN}[5/5] FFmpeg is already installed${NC}"
else
    echo -e "${YELLOW}[5/5] FFmpeg not found${NC}"
    echo -e "${BLUE}[5/5] Installing FFmpeg...${NC}"
    apk add ffmpeg && echo -e "${GREEN}[5/5] FFmpeg installed successfully${NC}"
fi

echo -e "${GREEN}All done.${NC}"
