import random

class CPFGenerator:
    
    def gerar_cpf(self):
        cpf = [random.randint(0, 9) for _ in range(9)]

        # 1º dígito
        soma = sum([(10 - i) * cpf[i] for i in range(9)])
        resto = (soma * 10) % 11
        dv1 = 0 if resto == 10 else resto
        cpf.append(dv1)

        # 2º dígito
        soma = sum([(11 - i) * cpf[i] for i in range(10)])
        resto = (soma * 10) % 11
        dv2 = 0 if resto == 10 else resto
        cpf.append(dv2)

        # 🔥 Sempre sem pontuação
        return ''.join(map(str, cpf))