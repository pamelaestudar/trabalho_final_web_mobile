document.addEventListener("DOMContentLoaded", function () {
    const pedidoId = new URLSearchParams(window.location.search).get("id");
    const apiPedidosUrl = `http://localhost:8080/pedidos/${pedidoId}`;

    fetch(apiPedidosUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao buscar pedido: ${response.status}`);
            }
            return response.json();
        })
        .then(pedido => {
            document.getElementById("descricao").textContent = pedido.descricao;
            document.getElementById("valorTotal").textContent = pedido.valorTotal.toFixed(2);
            document.getElementById("status").textContent = pedido.status;
            document.getElementById("cliente").textContent = pedido.cliente?.nome || "Cliente não encontrado";
        })
        .catch(error => {
            console.error("Erro ao carregar os detalhes do pedido:", error);
            alert("Erro ao carregar os detalhes do pedido. Tente novamente mais tarde.");
        });
});
