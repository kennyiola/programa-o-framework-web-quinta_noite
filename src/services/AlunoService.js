const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");

class AlunoService{

    async findMany(page, pageSize, orderBy = "id", order = "asc"){
    const alunos = await prisma.aluno.findMany({
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        orderBy: {
            [orderBy]: order
        }
    });

    const total = await prisma.aluno.count();

    return {
        alunos, total
    };
}

    async create(aluno){
        const {nome, email} = aluno;
        if(!nome || !email){
            throw new AlunoInvalidoError();
        }

        const novoAluno = await prisma.aluno.create({data: aluno});

        return novoAluno;
    }

 async findUnique(id){
    const aluno = await prisma.aluno.findUnique({
        where: {
            id: Number(id)
        }
    });

    if(!aluno){
        throw new AlunoNaoEncontradoError();
    }

    return aluno;
}

async update(id, dados){
    const aluno = await prisma.aluno.findUnique({
        where: {
            id: Number(id)
        }
    });

    if(!aluno){
        throw new AlunoNaoEncontradoError();
    }

    const {nome, email} = dados;

    if(nome === undefined && email === undefined){
        throw new AlunoInvalidoError(
            "Informe pelo menos nome ou email para atualizar"
        );
    }

    const data = {};

    if(nome !== undefined){
        data.nome = nome;
    }

    if(email !== undefined){
        data.email = email;
    }

    try{
        const alunoAtualizado = await prisma.aluno.update({
            where: {
                id: Number(id)
            },
            data
        });

        return alunoAtualizado;

    }catch(error){
        if(error.code === "P2002"){
            throw new AlunoInvalidoError(
                "Este email já está cadastrado"
            );
        }

        throw error;
    }
}

}

module.exports = new AlunoService();