# PayPay Africa TypeScript SDK

Este SDK TypeScript fornece uma interface completa para integração com a API PayPay Africa, permitindo processar pagamentos via PayPay APP, MULTICAIXA Express e por referência.

## Características

- ✅ Suporte completo para todos os métodos de pagamento PayPay Africa
- ✅ Encriptação e assinatura RSA automática
- ✅ Verificação de assinaturas de resposta
- ✅ TypeScript com tipagem completa
- ✅ Tratamento de erros robusto
- ✅ Exemplos de uso detalhados

## Métodos de Pagamento Suportados

1. **PayPay APP** - Pagamentos através da aplicação móvel PayPay
2. **MULTICAIXA Express** - Pagamentos através do sistema MULTICAIXA Express
3. **Pagamento por Referência** - Pagamentos através de referência bancária
4. **Transferências** - Transferências para contas bancárias e contas PayPay
5. **Reembolsos** - Processamento de reembolsos totais e parciais
6. **Consultas** - Verificação do status de pagamentos

## Instalação

```bash
npm install crypto
# ou
yarn add crypto
```

## Configuração

Antes de usar o SDK, é necessário configurar as suas credenciais PayPay:

```typescript
import PayPaySDK, { PayPayConfig } from './paypay-typescript-sdk';

const config: PayPayConfig = {
  partnerId: 'SEU_PARTNER_ID',
  privateKey: `-----BEGIN PRIVATE KEY-----
SEU_PRIVATE_KEY_AQUI
-----END PRIVATE KEY-----`,
  publicKey: `-----BEGIN PUBLIC KEY-----
CHAVE_PUBLICA_PAYPAY_AQUI
-----END PUBLIC KEY-----`,
  baseUrl: 'https://openapi.paypayafrica.com/gateway.do', // Opcional
  version: '1.0', // Opcional
  charset: 'UTF-8', // Opcional
  format: 'JSON', // Opcional
  language: 'pt' // Opcional
};

const payPaySDK = new PayPaySDK(config);
```

## Uso Básico

### 1. Pagamento via PayPay APP

```typescript
const payment = {
  requestNo: `PAY_${Date.now()}`,
  amount: 1000, // 1000 AOA
  currency: 'AOA',
  subject: 'Compra de produto',
  body: 'Descrição detalhada do produto',
  notifyUrl: 'https://seusite.com/notify',
  returnUrl: 'https://seusite.com/return',
  timeoutExpress: '30m'
};

const response = await payPaySDK.createPayPayAppPayment(payment);

if (response.code === '10000') {
  // Redirecionar para o URL de pagamento
  window.location.href = response.bizContent.payUrl!;
}
```

### 2. Pagamento via MULTICAIXA Express

```typescript
const payment = {
  requestNo: `MCX_${Date.now()}`,
  amount: 2500,
  currency: 'AOA',
  subject: 'Pagamento de serviço',
  notifyUrl: 'https://seusite.com/notify',
  returnUrl: 'https://seusite.com/return'
};

const response = await payPaySDK.createMulticaixaExpressPayment(payment);

if (response.code === '10000') {
  // Exibir QR Code para o utilizador
  console.log('QR Code:', response.bizContent.qrCode);
}
```

### 3. Pagamento por Referência

```typescript
const payment = {
  requestNo: `REF_${Date.now()}`,
  amount: 5000,
  currency: 'AOA',
  subject: 'Pagamento de fatura',
  notifyUrl: 'https://seusite.com/notify',
  returnUrl: 'https://seusite.com/return',
  timeoutExpress: '24h'
};

const response = await payPaySDK.createReferencePayment(payment);

if (response.code === '10000') {
  // Exibir referência para o utilizador
  console.log('Referência:', response.bizContent.reference);
}
```

### 4. Consultar Status de Pagamento

```typescript
const response = await payPaySDK.queryPayment({
  outTradeNo: 'PAY_1234567890'
});

if (response.code === '10000') {
  console.log('Status:', response.bizContent);
}
```

### 5. Processar Reembolso

```typescript
const response = await payPaySDK.refundPayment({
  outTradeNo: 'PAY_1234567890',
  refundAmount: 500,
  refundReason: 'Produto defeituoso',
  outRequestNo: `REFUND_${Date.now()}`
});
```

### 6. Transferência Bancária

```typescript
const response = await payPaySDK.transferToBankAccount({
  outBizNo: `TRANSFER_${Date.now()}`,
  payeeType: 'ALIPAY_LOGONID',
  payeeAccount: 'AO06000000012345678901234',
  amount: 1000,
  payerShowName: 'Sua Empresa Lda',
  payeeRealName: 'João Silva',
  remark: 'Pagamento de salário'
});
```

## Tratamento de Notificações

O PayPay envia notificações para o seu `notifyUrl` quando o status de um pagamento muda. Aqui está como processar essas notificações:

```typescript
import { PayPayIntegration } from './paypay-usage-examples';

const integration = new PayPayIntegration(config);

// No seu endpoint de notificação
app.post('/paypay/notify', async (req, res) => {
  const success = await integration.processNotification(req.body);
  
  if (success) {
    res.status(200).send('success');
  } else {
    res.status(400).send('fail');
  }
});
```

## Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 10000  | Sucesso |
| 20000  | Erro do sistema |
| 20001  | Parâmetros inválidos |
| 40001  | Parceiro não existe |
| 40002  | Assinatura inválida |
| 40004  | Erro de encriptação |

## Segurança

### Gestão de Chaves RSA

1. **Gerar chave privada:**
```bash
openssl genrsa -out rsa_private_key.pem 1024
```

2. **Gerar chave pública:**
```bash
openssl rsa -in rsa_private_key.pem -pubout -out rsa_public_key.pem
```

3. **Carregar a chave pública no portal PayPay**
4. **Descarregar a chave pública do PayPay**

### Boas Práticas

- ✅ Mantenha as chaves privadas seguras e nunca as exponha
- ✅ Use HTTPS para todas as comunicações
- ✅ Valide sempre as assinaturas das respostas
- ✅ Implemente timeouts apropriados
- ✅ Registe todas as transações para auditoria
- ✅ Use números de transação únicos

## Ambiente de Teste vs Produção

**Nota:** Atualmente, o PayPay Africa apenas fornece ambiente de produção. Todas as transações geram fundos reais.

## Suporte

Para questões técnicas ou problemas com a integração:

1. Consulte a documentação oficial: https://portal.paypayafrica.com/passport/apidoc/guide
2. Entre em contacto com o suporte PayPay Africa
3. Verifique os logs de erro para detalhes específicos

## Licença

Este SDK é fornecido como exemplo de integração. Consulte os termos de serviço do PayPay Africa para uso comercial.

## Contribuições

Contribuições são bem-vindas! Por favor:

1. Faça fork do repositório
2. Crie uma branch para a sua funcionalidade
3. Adicione testes se aplicável
4. Submeta um pull request

## Changelog

### v1.0.0
- Implementação inicial do SDK
- Suporte para todos os métodos de pagamento
- Exemplos de uso completos
- Documentação detalhada

