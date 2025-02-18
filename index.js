// Importações principais do Discord.js e API para comandos
const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');


const token = 'TOKEN_HERE'; 
const clientId = 'CLIENT_ID'; 
const guildId = 'GUILD_ID';
const canalId = 'CHANNEL_ID'; 

// Inicializa o cliente do bot com intenções necessárias
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Variáveis para contagem de data
let currentDay = 1;
let currentMonth = 0;
let currentYear = 2024;

// IDs de usuários permitidos a usar o comando `/data`
const allowedUserIds = ['ID_USER_1', 'ID_USER_2', 'ID_USER_3'];

// Definição dos meses e dias para controle de contagem
const meses = [
    { name: 'Janeiro', days: 31 },
    { name: 'Fevereiro', days: 28 }, 
    { name: 'Março', days: 31 },
    { name: 'Abril', days: 30 },
    { name: 'Maio', days: 31 },
    { name: 'Junho', days: 30 },
    { name: 'Julho', days: 31 },
    { name: 'Agosto', days: 31 },
    { name: 'Setembro', days: 30 },
    { name: 'Outubro', days: 31 },
    { name: 'Novembro', days: 30 },
    { name: 'Dezembro', days: 31 }
];

let canal; // Definido para uso global após a inicialização

client.once('ready', async () => {
    console.log('Bot está pronto!');

    // Registra o comando de barra `/data` no servidor
    const rest = new REST({ version: '9' }).setToken(token);
    try {
        console.log('Registrando comandos de barra...');
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: [
                new SlashCommandBuilder()
                    .setName('data')
                    .setDescription('Inicia a contagem a partir de uma data específica')
                    .addIntegerOption(option => 
                        option.setName('dia')
                            .setDescription('Dia')
                            .setRequired(true))
                    .addStringOption(option => 
                        option.setName('mes')
                            .setDescription('Mês')
                            .setRequired(true))
                    .addIntegerOption(option => 
                        option.setName('ano')
                            .setDescription('Ano')
                            .setRequired(true)),
            ],
        });
        console.log('Comandos de barra registrados com sucesso.');
    } catch (error) {
        console.error('Erro ao registrar comandos de barra:', error);
    }

    // Busca o canal para envio de mensagens
    canal = client.channels.cache.get(canalId);
    if (canal) {
        canal.send('O sistema de mensagens temporárias está ativado!')
            .then(() => console.log('Mensagem de ativação enviada.'))
            .catch(e => console.log('Erro ao enviar mensagem de ativação:', e));
    } else {
        console.log(`Canal com ID ${canalId} não encontrado.`);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, user } = interaction;

    if (commandName === 'data') {
        // Verifica permissão do usuário
        if (!allowedUserIds.includes(user.id)) {
            await interaction.reply('Você não tem permissão para usar este comando.');
            return;
        }

        // Recebe as opções do comando
        const dia = interaction.options.getInteger('dia');
        const mes = interaction.options.getString('mes');
        const ano = interaction.options.getInteger('ano');

        // Mapeia os meses para seus índices correspondentes
        const mesesMap = {
            'janeiro': 0,
            'fevereiro': 1,
            'março': 2,
            'abril': 3,
            'maio': 4,
            'junho': 5,
            'julho': 6,
            'agosto': 7,
            'setembro': 8,
            'outubro': 9,
            'novembro': 10,
            'dezembro': 11
        };

        currentDay = dia;
        currentMonth = mesesMap[mes.toLowerCase()];
        currentYear = ano;

        // Responde ao usuário com a data inicial da contagem
        await interaction.reply(`Contagem iniciada a partir de ${currentDay} de ${mes} de ${currentYear}`);
        
        // Inicia um intervalo que envia mensagens diárias com a data atualizada
        setInterval(() => {
            const dateMessage = `Dia ${currentDay} de ${meses[currentMonth].name} de ${currentYear}`;
            console.log('Enviando mensagem:', dateMessage);
            canal.send(dateMessage)
                .then(() => console.log('Mensagem enviada:', dateMessage))
                .catch(e => console.log('Erro ao enviar mensagem:', e));

            // Incrementa o dia e faz a contagem avançar entre meses e anos
            currentDay++;

            if (currentDay > meses[currentMonth].days) {
                currentDay = 1;
                currentMonth++;

                if (currentMonth >= meses.length) {
                    currentMonth = 0;
                    currentYear++;
                }
            }
        }, 2000);
    }
});

// Faz login no bot
client.login(token)
    .then(() => console.log('Bot fez login com sucesso.'))
    .catch(e => console.log('Erro ao fazer login:', e));
// Hi faruk
