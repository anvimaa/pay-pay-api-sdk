# Documentação da API PayPay Africa

Este documento descreve a API do gateway de pagamento PAYPAY, que pode ser utilizada por clientes PAYPAY para pagar bens e serviços a parceiros.

## Tipos de comunicação suportados pela API:

### HTTPS POST

Content-Type: application/json

Quando o cliente escolhe usar PAYPAY para transações na aplicação/site do parceiro, o parceiro solicita à API do PAYPAY, através do servidor, a criação de uma ordem de pagamento. O resultado da resposta da API é um URL e um token.

## Gestão de RSA

### 2.1 Gerar a chave privada

### 2.2 Gerar a chave pública

É necessário fazer login no back office do PAYPAY com uma conta empresarial. Se não tiver uma conta empresarial PAYPAY, deve registar-se através do PAYPAY AO e aguardar a aprovação do nome real da empresa.

1.  Descarregar a chave pública do PAYPAY.
2.  Carregar a chave pública do parceiro. O parceiro deve manter a chave privada para evitar a sua divulgação.

Nota: O algoritmo de verificação de assinatura RSA utiliza "SHA1withRSA", o algoritmo de encriptação e desencriptação utiliza "RSA", e o comprimento da chave é 1024.

Nota: Atualmente, apenas é fornecido o ambiente de produção para conexão, e os fundos são realmente gerados.

### 2.3 Encriptação

Apenas o valor "biz_content" do parâmetro de solicitação da API precisa ser encriptado. O parceiro precisa usar a chave privada RSA para encriptação, e o algoritmo de encriptação utiliza RSA.

### 2.4 Assinatura

Passo 1: Ordenar os parâmetros de solicitação da API de menor para maior de acordo com ASCII, e concatená-los no formato de dados de pares chave-valor. Exemplo:

`biz_content=VALUE&charset=VALUE&format=VALUE&language=VALUE&partner_id=VALUE&request_no=VALUE&service=VALUE&timestamp=VALUE&version=VALUE`

Nota: "sign" e "sign_type" dos parâmetros de solicitação da API não participam na assinatura.

Passo 2: Usar a chave privada RSA do parceiro para assinatura, e o algoritmo de assinatura utiliza "SHA1withRSA".

Passo 3: Atribuir o valor da assinatura ao parâmetro de solicitação da API "sign".

## Introdução à API

### 1. Criar pagamento e pagar com a aplicação PayPay

Após a solicitação dos parceiros (comerciantes) para criar um pagamento, os utilizadores utilizam a aplicação PAYPAY para completar o pagamento.

### 2. Criar pagamento e pagar com MULTICAIXA Expre

Após a solicitação dos parceiros (comerciantes) para criar um pagamento, os utilizadores utilizam o MULTICAIXA Expre para completar o pagamento.

### 3. Criar pagamento e pagar com Referência

Após a solicitação dos parceiros (comerciantes) para criar um pagamento, os utilizadores utilizam a referência para completar o pagamento.

### 4. Reembolsar pagamento

Os parceiros (comerciantes) podem solicitar reembolsos, suportando reembolsos totais e parciais, com um máximo de 180 dias a partir da data da transação elegível para reembolsos.

### 5. Fechar pagamento

Os parceiros (comerciantes) solicitam o encerramento do pagamento. Após o encerramento do pagamento, o utilizador não pode continuar a pagar.

### 6. Consultar o estado da ordem de pagamento

Os parceiros (comerciantes) podem usar esta API para consultar o estado da ordem de pagamento de "Criar pagamento para conta bancária e Pagamento para conta PAYPAY".

### 7. Pagamento para conta bancária

O serviço iniciado pelo parceiro (comerciante), transferindo fundos da conta PAYPAY do comerciante para uma conta bancária especificada (IBAN).

### 8. Pagamento para conta PAYPAY

O serviço iniciado pelo parceiro (comerciante), transferindo fundos da conta PAYPAY do comerciante para a conta PAYPAY do utilizador.

