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
- [ ] Faker em testes
- [ ] Iniciar a reserva de sala
- [ ] Funcionario vs Estudante
- [ ] Coming soon ...


## Regras de Negócio

### Aluno
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


### Reserva
- [ ]  A Sala da reserva pode ser Reservada várias vezes
- [ ]  A Sala da reserva não pode ser reservada em dois horários iguais na
mesma data

- [ ]  Necessita de ao menos 3 alunos para a reserva
- [ ]  As matriculas dos alunos devem ser distintas


## Problemas + Soluções
- [ ]  Deveria poder fazer uma reserva com muita antecedencia? Falar caso da Prova ⇒ Permitir somente apos as 6


## Problemas + Ver Depois
- [ ]  Precisa apagar um horario? Ou so vai precisar atualiza-lo?
