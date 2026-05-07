# 🤖 Automação com Robot Framework + Selenium

Projeto de automação de testes utilizando **Python**, **Robot Framework** e **Selenium**.

---

## 💻 1. Instalar o Visual Studio Code (PRIMEIRO PASSO)

Acesse:
https://code.visualstudio.com/

Baixe e instale normalmente.

---

## 🔌 2. Instalar extensões no VS Code

Abra o VS Code → vá em **Extensions** (ícone lateral) e instale:

* Python (Microsoft)
* RobotCode – Robot Framework Support (Daniel Biehl)
* EditorConfig
* Material Icon Theme
* Prettier – Code Formatter

💡 Essas extensões ajudam com:

* Autocomplete
* Identação automática
* Destaque de sintaxe
* Reconhecimento do ambiente Python

---

## 🖥️ 3. Usar o terminal do VS Code

Abra o terminal dentro do VS Code:

```bash
Ctrl + `
```

📌 Utilize esse terminal para todos os comandos abaixo (melhor que o terminal padrão do Windows).

---

## 🚀 4. Instalar o Python

Acesse:
https://www.python.org/downloads/

Versão recomendada:
https://www.python.org/downloads/release/python-3130/

Durante a instalação:

* Marque **Add Python to PATH**
* Clique em **Install Now**

---

### ✅ Validar instalação

No terminal do VS Code:

```bash
python --version
```

ou

```bash
py --version
```

Resultado esperado:

```
Python 3.13.x
```

---

## 🧰 5. Instalar o Git

Download:
https://git-scm.com/downloads

Validar instalação:

```bash
git --version
```

---

## 📦 6. Instalar dependências do projeto

No terminal do VS Code, dentro da pasta do projeto:

### 🔹 Atualizar pip

```bash
python -m pip install --upgrade pip
```

### 🔹 Instalar dependências via requirements.txt (recomendado)

```bash
pip install -r requirements.txt
```

📌 Caso não utilize o arquivo, instale manualmente:

```bash
pip install robotframework
pip install robotframework-seleniumlibrary
pip install selenium
```

---

### ✅ Validar instalação do Selenium

```bash
pip show selenium
```

Resultado esperado:

* Versão 4.x

---

## ▶️ 7. Executar automação

No terminal, dentro da pasta do projeto:

```bash
robot -d ./logs -i RunTagAqui tests
```

---

## 📁 Estrutura do projeto

```
📦 projeto
 ┣ 📂 files
 ┣ 📂 logs
 ┣ 📂 resources
 ┣ 📂 tests
 ┣ .gitignore
 ┣ .gitlab-ci.yml
 ┣ README.md
 ┗ requirements.txt
```

---

## ⚠️ Observações importantes

* Utilize sempre o terminal do VS Code
* Instale o Python antes das dependências
* Projeto simplificado
* Prefira `requirements.txt` para facilitar setup
* Tags ajudam na execução seletiva dos testes

---
