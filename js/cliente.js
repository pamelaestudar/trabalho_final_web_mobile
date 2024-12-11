document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = "http://localhost:8080/clientes";

    // Função para validar CPF
    function validarCpf(cpf) {
        cpf = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
        let resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;

        return resto === parseInt(cpf.charAt(10));
    }

    // Filtro de clientes
    function filtrarClientes(clientes) {
        const filtroNome = document.getElementById("filtroNome").value.toLowerCase();
        const filtroCpf = document.getElementById("filtroCpf").value;

        return clientes.filter(cliente =>
            cliente.nome.toLowerCase().includes(filtroNome) &&
            cliente.cpf.includes(filtroCpf)
        );
    }

    // Função para carregar a lista de clientes com filtro
    function carregarClientes() {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar clientes: ${response.status}`);
                }
                return response.json();
            })
            .then(clientes => {
                const tabelaBody = document.getElementById("clientesTableBody");
                tabelaBody.innerHTML = ""; // Limpa a tabela antes de adicionar os dados

                const clientesFiltrados = filtrarClientes(clientes);

                clientesFiltrados.forEach(cliente => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${cliente.nome}</td>
                        <td>${cliente.cpf}</td>
                        <td>${cliente.telefone}</td>
                        <td>${cliente.endereco || "Não informado"}</td>
                        <td>
                            <button class="btn btn-warning" onclick="editarCliente('${cliente.id}')">Editar</button>
                            <button class="btn btn-danger" onclick="excluirCliente('${cliente.id}')">Excluir</button>
                        </td>
                    `;
                    tabelaBody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error("Erro ao carregar clientes:", error);
                alert("Erro ao carregar clientes. Tente novamente mais tarde.");
            });
    }

    // Função para redirecionar para a tela de edição
    window.editarCliente = function (clienteId) {
        window.location.href = `criar_cliente.html?id=${clienteId}`;
    };

    // Preencher formulário na edição
    (function preencherFormularioEdicao() {
        const clienteId = new URLSearchParams(window.location.search).get("id");
        if (clienteId) {
            fetch(`${apiUrl}/${clienteId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erro ao buscar cliente: ${response.status}`);
                    }
                    return response.json();
                })
                .then(cliente => {
                    document.getElementById("nome").value = cliente.nome;
                    document.getElementById("cpf").value = cliente.cpf;
                    document.getElementById("telefone").value = cliente.telefone;
                    document.getElementById("endereco").value = cliente.endereco || "";
                })
                .catch(error => {
                    console.error("Erro ao carregar cliente para edição:", error);
                    alert("Erro ao carregar cliente. Tente novamente mais tarde.");
                });
        }
    })();

    // Função para salvar ou editar cliente
    document.getElementById("formCliente")?.addEventListener("submit", function (event) {
        event.preventDefault();

        const clienteId = new URLSearchParams(window.location.search).get("id");
        const cliente = {
            nome: document.getElementById("nome").value.trim(),
            cpf: document.getElementById("cpf").value.trim(),
            telefone: document.getElementById("telefone").value.trim(),
            endereco: document.getElementById("endereco").value.trim(),
        };

        if (!cliente.nome || !cliente.cpf || !cliente.telefone) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        if (!validarCpf(cliente.cpf)) {
            alert("CPF inválido. Por favor, insira um CPF válido.");
            return;
        }

        const metodo = clienteId ? "PUT" : "POST";
        const url = clienteId ? `${apiUrl}/${clienteId}` : apiUrl;

        fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cliente),
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw new Error(errorMessage);
                    });
                }
                alert(clienteId ? "Cliente atualizado com sucesso!" : "Cliente criado com sucesso!");
                window.location.href = "listar_clientes.html";
            })
            .catch(error => {
                console.error("Erro ao salvar cliente:", error);

                if (error.message.includes("Já existe um cliente cadastrado com este CPF")) {
                    alert("Erro: Já existe um cliente cadastrado com este CPF.");
                } else {
                    alert(error.message || "Já existe um cliente cadastrado com este CPF.");
                }
            });
    });

    // Função para excluir um cliente
    window.excluirCliente = function (clienteId) {
        if (confirm("Tem certeza que deseja excluir este cliente?")) {
            fetch(`${apiUrl}/${clienteId}`, {
                method: "DELETE",
            })
                .then(response => {
                    if (!response.ok) {
                        // Se a resposta não for bem-sucedida, extrai o corpo da resposta para obter a mensagem de erro
                        return response.text().then(errorMessage => {
                            throw new Error(errorMessage);
                        });
                    }
                    alert("Cliente excluído com sucesso!");
                    carregarClientes(); // Atualiza a lista de clientes
                })
                .catch(error => {
                    console.error("Erro ao excluir cliente:", error);
                    alert(error.message || "Erro ao excluir cliente. Ele possuí pedidos vinculados.");
                });
        }
    };
    

    // Adiciona eventos para os campos de filtro
    document.getElementById("filtroNome").addEventListener("input", carregarClientes);
    document.getElementById("filtroCpf").addEventListener("input", carregarClientes);

    // Carrega os clientes ao carregar a página
    carregarClientes();
});
