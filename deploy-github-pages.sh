#!/bin/bash

# EVE - GitHub Pages Deploy Script
# Execute este script para fazer deploy no GitHub Pages

set -e

echo "🚀 Iniciando deploy do EVE para GitHub Pages..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto EVE"
    exit 1
fi

# Verificar se o build existe
if [ ! -d "out" ]; then
    echo "📦 Gerando build estático..."
    npm run build
fi

# Inicializar Git se necessário
if [ ! -d ".git" ]; then
    echo "📂 Inicializando repositório Git..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Verificar se o remote existe
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "⚠️  Nenhum remote configurado."
    echo "   Crie um repositório no GitHub e execute:"
    echo ""
    echo "   git remote add origin https://github.com/SEU_USUARIO/eve.git"
    echo ""
    echo "   Depois execute este script novamente."
    exit 1
fi

# Criar branch gh-pages
echo "🌿 Criando branch gh-pages..."
git checkout -B gh-pages

# Adicionar arquivos estáticos
echo "📁 Adicionando arquivos estáticos..."
git add -f out/
git commit -m "Deploy to GitHub Pages"

# Push para GitHub
echo "⬆️  Fazendo push para GitHub..."
git push origin gh-pages --force

# Voltar para main
git checkout main

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Acesse as configurações do seu repositório no GitHub"
echo "   2. Vá para Settings > Pages"
echo "   3. Em Source, selecione 'Deploy from a branch'"
echo "   4. Selecione a branch 'gh-pages' e a pasta '/ (root)'"
echo "   5. Clique em Save"
echo ""
echo "🌐 Seu site estará disponível em:"
echo "   https://SEU_USUARIO.github.io/eve/"
