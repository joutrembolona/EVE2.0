# EVE - Deploy no GitHub Pages

## 🚀 Deploy Automático (Recomendado)

O projeto já está configurado com GitHub Actions para deploy automático.

### Passos:

1. **Crie um repositório no GitHub**
   - Acesse [github.com/new](https://github.com/new)
   - Nome: `eve` (ou qualquer nome que preferir)
   - Deixe público para usar GitHub Pages grátis
   - NÃO inicialize com README, .gitignore ou licença

2. **Conecte o repositório local**
   ```bash
   cd C:\Users\Josep\eve
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/SEU_USUARIO/eve.git
   git push -u origin main
   ```

3. **Ative o GitHub Pages**
   - Acesse Settings > Pages no seu repositório
   - Em Source, selecione **GitHub Actions**
   - Pronto! O deploy será automático a cada push

4. **Acesse seu site**
   ```
   https://SEU_USUARIO.github.io/eve/
   ```

---

## 🛠️ Deploy Manual

Se preferir fazer o deploy manualmente:

```bash
cd C:\Users\Josep\eve
chmod +x deploy-github-pages.sh
./deploy-github-pages.sh
```

---

## 📁 Estrutura dos Arquivos

- `out/` - Arquivos estáticos gerados pelo build
- `.github/workflows/deploy.yml` - Workflow do GitHub Actions
- `deploy-github-pages.sh` - Script de deploy manual

---

## ⚙️ Configuração do Next.js

O projeto já está configurado para exportação estática em `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};
```

---

## 🔄 Atualizações

Para atualizar o site:

```bash
# Faça suas alterações no código
# Depois:
git add .
git commit -m "Descrição das alterações"
git push origin main
```

O GitHub Actions fará o deploy automaticamente!
