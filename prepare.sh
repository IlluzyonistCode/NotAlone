#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
DRY_RUN=false

if [ "$1" = "--dry-run" ] || [ "$1" = "-n" ]; then
    DRY_RUN=true
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
    SED_INPLACE="sed -i ''"
else
    SED_INPLACE="sed -i"
fi

DOMAIN="not-alone.corruptor.pro"
PORT="5000"
PRODUCTION_URL="https://${DOMAIN}:${PORT}"
PRODUCTION_URL_NO_PORT="https://${DOMAIN}"

echo "Preparing NotAlone for production..."
echo "API Domain: ${PRODUCTION_URL}"
echo "Frontend Domain: ${PRODUCTION_URL_NO_PORT}"
if [ "$DRY_RUN" = true ]; then
    echo "Mode: dry-run (no changes will be made)"
fi
echo ""

replace_in_file() {
    local file="$1"
    local pattern="$2"
    local replacement="$3"
    
    if grep -qE "$pattern" "$file" 2>/dev/null; then
        if [ "$DRY_RUN" = false ]; then
            $SED_INPLACE "s|${pattern}|${replacement}|g" "$file"
        fi
        return 0
    fi
    return 1
}

FILES=$(find "$PROJECT_ROOT" -type f \( -name "*.js" -o -name "*.jsx" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/dist/*" \
    ! -path "*/build/*" \
    ! -path "*/coverage/*" \
    2>/dev/null)

if [ -z "$FILES" ]; then
    echo "Error: No JS files found"
    exit 1
fi

CHANGED_COUNT=0

for file in $FILES; do
    if replace_in_file "$file" \
        "http://localhost:4000/graphql" \
        "${PRODUCTION_URL}/graphql"; then
        CHANGED_COUNT=$((CHANGED_COUNT + 1))
        echo "  [graphql] $file"
    fi
done

for file in $FILES; do
    if replace_in_file "$file" \
        "ws://localhost:4000/subscription" \
        "wss://${DOMAIN}:${PORT}/subscription"; then
        CHANGED_COUNT=$((CHANGED_COUNT + 1))
        echo "  [ws] $file"
    fi
done

for file in $FILES; do
    if replace_in_file "$file" \
        "http://localhost:4000/upload" \
        "${PRODUCTION_URL}/upload"; then
        CHANGED_COUNT=$((CHANGED_COUNT + 1))
        echo "  [upload] $file"
    fi

    if replace_in_file "$file" \
        "http://localhost:4000/userfiles/" \
        "${PRODUCTION_URL}/userfiles/"; then
        CHANGED_COUNT=$((CHANGED_COUNT + 1))
        echo "  [userfiles] $file"
    fi

    if replace_in_file "$file" \
        "http://localhost:4000/sounds/" \
        "${PRODUCTION_URL}/sounds/"; then
        CHANGED_COUNT=$((CHANGED_COUNT + 1))
        echo "  [sounds] $file"
    fi
done

for file in $FILES; do
    if replace_in_file "$file" \
        "http://localhost:3000/api/auth/session" \
        "${PRODUCTION_URL_NO_PORT}/api/auth/session"; then
        CHANGED_COUNT=$((CHANGED_COUNT + 1))
        echo "  [auth] $file"
    fi
done

for file in $FILES; do
    if grep -qE "http://localhost:4000" "$file" 2>/dev/null; then
        if replace_in_file "$file" \
            "http://localhost:4000" \
            "${PRODUCTION_URL}"; then
            CHANGED_COUNT=$((CHANGED_COUNT + 1))
            echo "  [base:4000] $file"
        fi
    fi
done

SERVER_INDEX="$PROJECT_ROOT/server/index.js"

if [ -f "$SERVER_INDEX" ]; then
    if ! grep -q "${PRODUCTION_URL_NO_PORT}" "$SERVER_INDEX" 2>/dev/null; then
        if [ "$DRY_RUN" = false ]; then
            $SED_INPLACE "s|origin: \['http://localhost:3000', 'http://localhost:4000'\],|origin: ['${PRODUCTION_URL_NO_PORT}', 'http://localhost:3000', 'http://localhost:4000'],|g" "$SERVER_INDEX"
            $SED_INPLACE "s|origin: \['http://localhost:3000'\],|origin: ['${PRODUCTION_URL_NO_PORT}', 'http://localhost:3000'],|g" "$SERVER_INDEX"
        fi
        CHANGED_COUNT=$((CHANGED_COUNT + 1))
        echo "  [cors] $SERVER_INDEX"
    fi
fi

echo ""
if [ "$DRY_RUN" = true ]; then
    echo "Dry-run completed. Found ${CHANGED_COUNT} potential changes."
else
    echo "Done. Updated ${CHANGED_COUNT} file(s)."
fi