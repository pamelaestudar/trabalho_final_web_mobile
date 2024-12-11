document.addEventListener("DOMContentLoaded", function () {
    const apiPedidosUrl = "http://localhost:8080/pedidos";
    const apiClientesUrl = "http://localhost:8080/clientes";

    // Função para carregar a lista de pedidos
    function carregarPedidos() {
        const tabelaBody = document.getElementById("pedidosTableBody");
        if (!tabelaBody) {
            console.error("Elemento pedidosTableBody não encontrado. Verifique o ID no HTML.");
            return;
        }

        fetch(apiPedidosUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar pedidos: ${response.status}`);
                }
                return response.json();
            })
            .then(pedidos => {
                tabelaBody.innerHTML = ""; // Limpa a tabela antes de adicionar os dados

                pedidos.forEach(pedido => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${pedido.descricao}</td>
                        <td>${pedido.valorTotal.toFixed(2)}</td>
                        <td>${pedido.status}</td>
                        <td>${pedido.cliente?.nome || "Não informado"}</td>
                        <td>
                            <button class="btn btn-warning" onclick="editarPedido('${pedido.id}')">Editar</button>
                            <button class="btn btn-danger" onclick="excluirPedido('${pedido.id}')">Excluir</button>
                            <button class="btn btn-info" onclick="verDetalhesPedido('${pedido.id}')">Detalhes</button>
                        </td>
                    `;
                    tabelaBody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error("Erro ao carregar pedidos:", error);
                alert("Erro ao carregar pedidos. Tente novamente mais tarde.");
            });
    }

    // Função para redirecionar para a tela de edição
    window.editarPedido = function (pedidoId) {
        window.location.href = `criar_pedidos.html?id=${pedidoId}`;
    };

    // Função para redirecionar para a tela de detalhes do pedido
    window.verDetalhesPedido = function (pedidoId) {
        window.location.href = `detalha_pedidos.html?id=${pedidoId}`;
    };

    // Preencher formulário na edição
    (function preencherFormularioEdicao() {
        const pedidoId = new URLSearchParams(window.location.search).get("id");
        if (pedidoId) {
            fetch(`${apiPedidosUrl}/${pedidoId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erro ao buscar pedido: ${response.status}`);
                    }
                    return response.json();
                })
                .then(pedido => {
                    document.getElementById("descricao").value = pedido.descricao;
                    document.getElementById("valorTotal").value = pedido.valorTotal;
                    document.getElementById("status").value = pedido.status;
                    document.getElementById("cliente").value = pedido.cliente?.id || "";
                })
                .catch(error => {
                    console.error("Erro ao carregar pedido para edição:", error);
                    alert("Erro ao carregar pedido. Tente novamente mais tarde.");
                });
        }
    })();

    // Preencher lista de clientes no formulário de pedido
    function carregarClientesNoFormulario() {
        const clienteSelect = document.getElementById("cliente");
        if (!clienteSelect) {
            console.error("Elemento cliente não encontrado no formulário.");
            return;
        }

        fetch(apiClientesUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar clientes: ${response.status}`);
                }
                return response.json();
            })
            .then(clientes => {
                clienteSelect.innerHTML = ""; // Limpa o select antes de adicionar os clientes

                clientes.forEach(cliente => {
                    const option = document.createElement("option");
                    option.value = cliente.id;
                    option.textContent = cliente.nome;
                    clienteSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Erro ao carregar clientes:", error);
                alert("Erro ao carregar clientes. Tente novamente mais tarde.");
            });
    }

    // Função para salvar ou editar pedido
    document.getElementById("formPedido")?.addEventListener("submit", function (event) {
        event.preventDefault();

        const pedidoId = new URLSearchParams(window.location.search).get("id");
        const pedido = {
            descricao: document.getElementById("descricao").value.trim(),
            valorTotal: parseFloat(document.getElementById("valorTotal").value),
            status: document.getElementById("status").value,
            cliente: { id: document.getElementById("cliente").value }
        };

        const metodo = pedidoId ? "PUT" : "POST";
        const url = pedidoId ? `${apiPedidosUrl}/${pedidoId}` : apiPedidosUrl;

        fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(pedido),
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw new Error(errorMessage);
                    });
                }
                alert(pedidoId ? "Pedido atualizado com sucesso!" : "Pedido criado com sucesso!");
                window.location.href = "listar_pedidos.html";
            })
            .catch(error => {
                console.error("Erro ao salvar pedido:", error);
                alert("Erro ao salvar pedido. Tente novamente mais tarde.");
            });
    });

    // Função para excluir um pedido
    window.excluirPedido = function (pedidoId) {
        if (confirm("Tem certeza que deseja excluir este pedido?")) {
            fetch(`${apiPedidosUrl}/${pedidoId}`, {
                method: "DELETE",
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erro ao excluir pedido: ${response.status}`);
                    }
                    alert("Pedido excluído com sucesso!");
                    carregarPedidos();
                })
                .catch(error => {
                    console.error("Erro ao excluir pedido:", error);
                    alert("Erro ao excluir pedido. Tente novamente mais tarde.");
                });
        }
    };

    // Carrega os pedidos ao carregar a página
    carregarPedidos();

    // Carrega os clientes no formulário de pedido
    carregarClientesNoFormulario();
});
