var getNome = function(){
    var nome;

    while(true){
        nome = prompt("Digite o seu nome: ");

        if(nome != null && nome.length > 0){
            break;
        }
    }

    return nome;
};

var nome = getNome();

$(function(){
    $("h1.myName").html(nome);

    var chatAtivo = -1;
    var contatosAtivos = [];

    $(document).on("click", "ul#listaContatos li.contato", function(){
        var nome = $(this).attr("userName");
        var id = $(this).attr("userID");
        var number = $(this).find("span.number");

        if(chatAtivo == -1){
            $("div#protetor").hide();
            $("div#chat").show();
        }

        $("ul#conversa").html("");
        $("h1.conversaTitle").html(nome);
        $("textarea").attr("idTo", id);
        number.addClass("of").attr("num", "0").html("0");
        
        chatAtivo = id;
    });

    var addContato = function(arr){
        var elm = $("ul#listaContatos");
        var elmHTML = "";
        var count = 0;

        contatosAtivos = arr;

        for(i = 0; i < arr.length; i++){
            if(arr[i] != nome && arr[i] != null && arr[i] != ""){
                elmHTML += `<li class="contato id${i}" userName="${arr[i]}" userID="${i}"><div id="imagem"><img src="../public/images/pessoa.png" /></div><div id="texto"><h1>${arr[i]} <span class="number of" num="0">0</span></h1></div></li>`;
                count += 1;
            }
        }

        elmHTML = `<li class="title">Contatos (${count})</li>` + elmHTML;
        elm.html(elmHTML);
    };

    var addMensagem = function(me, msg, from = -1){
        var nome = me == true ? "Você" : contatosAtivos[from];
        var elm = me == true ? `<li class="me">` : `<li>`;
            elm += `<div id="header"><img src="../public/images/pessoa.png" /><div id="info"><span class="nome">${nome}</span><span class="data">Hoje às 13:41</span></div></div><div id="mensagem"><p>${msg}</p></div></li>`;

        $("ul#conversa").append(elm);
    };

    var socket = io.connect("http://localhost:4000");

    socket.emit("message", JSON.stringify({type: "c", data: nome}));
    socket.on("message", mensagem => {
        mensagem = JSON.parse(mensagem);

        switch(mensagem.type){
            case "l":
                addContato(mensagem.data);
                break;    

            case "m":
                var from = mensagem.data[0];
                var msg = mensagem.data[1];

                if(chatAtivo == parseInt(from)){
                    addMensagem(false, msg, from);
                }else{
                    var elm = $(`li.contato.id${from}`);
                    var number = elm.find("span.number");

                    var count = parseInt(number.attr("num"));
                        count += 1;

                    number.removeClass("of").attr("num", count).html(count);
                }

                break;
        }
    });

    $("textarea").keydown(function(e){
        if(e.keyCode == 13){
            e.preventDefault();

            var to = $(this).attr("idTo");
            var msg = $(this).val();

            socket.emit("message", JSON.stringify({type: "m", data: [to, msg]}));
            addMensagem(true, msg);

            $(this).val("");
        }
    });
});