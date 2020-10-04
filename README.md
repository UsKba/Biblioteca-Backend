# TODO

## 1° Etapa
- [x] Revisar o código
- [x] Model User (Prisma)
- [x] Ver os testes
- [x] Fazer o CRUD de User
- [x] Rever as validacões (Yup)
- [x] Login
- [x] CRUD Salas

## 2° Etapa
- [x] Fazer a estrutura do Banco de Dados (Modelo descritivo)
- [x] Fazer o modelo (último) criar as tabelas
- [x] Ver rotas com o frontend
- [x] Mudar as mensagens para portugues
- [x] Iniciar a reserva de sala
- [ ] Funcionario vs Estudante
- [ ] Coming soon ...

## Coisas fazendo hoje
- [ ] consertar nomes de fields no prisma (sender e receiver em Invite)

- [ ] Ver 'Deletar' horario
- [ ] Ver 'Deletar' user

- [ ] 'should not be able to index invites where you are not the recipient' tests change message
- [ ] organizar o readme


## Coisas pra fazer depois
- [ ] Limite de reservas por turno por aluno
- [ ] Salvar dias e horarios de funcionameto
- [ ] Armazear turnos e relacionar com os schedules

- [ ] transfomar a matricula em id para o invite (search frontend)
- [ ] Lider do gp


## Regras de Negócio

### Aluno
- [x] Matricula unica
- [x] Email unico?


### Amigo

##### Falar com os kra
- [ ] Um aluno pode ter vários amigos
- [ ] Um aluno pode ser amigo de várias pessoas


### Sala
- [x] Não pode existir duas salas com a mesma sigla


### Horário
- [x] A hora final nao pode ser antes da de inicio
- [x] Não pode ser alocado dois horários dentro do mesmo intervalo de tempo

  Levando como base `07:00 - 08:00`
  - [x] 09:00 - 08:00 -> X

  - [x] 07:30 - 08:00 -> X
  - [x] 07:59 - 09:00 -> X

  - [x] 08:00 - 09:00 -> Y

- [ ] Ao deletar o horário o q acontece com a reserva?


### Reserva
- [x] Nao se pode cadastrar reserva em uma data anterior a hj
- [x] Nao se pode cadastrar reserva em uma um horario que não existe
- [x] A Sala da reserva pode ser Reservada várias vezes
- [x] Nao se pode cadastrar reserva em uma uma sala que não existe
- [x] Necessita de ao menos 3 alunos para a reserva
- [x] As matriculas dos alunos devem ser distintas
- [x] Os Alunos da reserva devem existir
- [x] A Sala da reserva não pode ser reservada caso ja tenha sido na mesma data
- [x] A Sala da reserva não pode ser reservada em dois horários iguais na
mesma data, na mesma sala, no mesmo horario
- [x] Final de semana

- [ ] Limite de reservas diárias por aluno


### campus

## Problemas + Soluções
- [ ]  Deveria poder fazer uma reserva com muita antecedencia? Falar caso da Prova ⇒ Permitir somente apos as 6
- [ ]  Horarios de funcionamento diferentes, bem como dias de trabalho => Armazenar os horarios de funcionameto bem como os dias


## Problemas + Ver Depois
- [ ]  Precisa apagar um horario? Ou so vai precisar atualiza-lo?
- [ ]  precisa armazenar os dias?
