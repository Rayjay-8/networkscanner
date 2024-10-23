import axios from "axios";
import generateIpRange from "./utils.js";
import express from 'express'

const app = express();
const port = 3000;


// Função para escanear a rede
async function scanNetwork(ipRange, port, path, sendEvent) {
    const activeIps = [];
    const timeout = 5000; // 5 segundos
    
    console.log(sendEvent)


    const requests = ipRange.map(ip => {
        const url = `http://${ip}:${port}${path}`;

        return axios.get(url, { timeout })
        .then(response => {
                
                if (response.data === true) { // se a API retornar true
                    console.log(`App ativo em: ${ip}`);
                    activeIps.push(ip);
                    sendEvent(`Scaneando: ${ip} SUCESSO!`);
                }
            })
            .catch(error => {
                sendEvent(`Scaneando: ${ip} erro = ${error.message}`);
                console.log(`Erro ao tentar conectar com ${ip}:`, error.message);
            });
    });

    await Promise.all(requests);
    return activeIps;
}

// Exemplo de uso
// const baseIp = '192.168.200.1'; // Base IP da rede
// const start = 1; // Primeiro IP a ser testado
// const end = 250; // Último IP a ser testado
// const ipRange = generateIpRange(baseIp, start, end);

// const port = 9999;
// const path = '/up';

// scanNetwork(ipRange, port, path).then(activeIps => {
//     console.log('IPs com app ativo:', activeIps);
// });

// Rota SSE para varredura de rede
app.get('/scan', (req, res) => {
    // Define o cabeçalho para SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Função auxiliar para enviar eventos ao cliente
    const sendEvent = (message) => {
        res.write(`data: ${message}\n\n`);
    };

    // Exemplo de IPs a serem verificados
    const baseIp = '192.168.200.1'; // Base IP da rede
    const start = 240; // Primeiro IP a ser testado
    const end = 250; // Último IP a ser testado
    const ipRange = generateIpRange(baseIp, start, end);

    const port = 9999;
    const path = '/up';

    // Executa a varredura da rede
    scanNetwork(ipRange, port, path, sendEvent).then(() => {
        // Envia uma mensagem final indicando o fim da varredura
        res.write('data: Varredura finalizada\n\n');
        res.end();
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});