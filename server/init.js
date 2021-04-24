const io = require("socket.io")({
  cors: "http://localhost:3000/",
});

const data = {};

io.on("connection", (socket) => {
  socket.on("get-document", (documentId) => {
    let document = "";
    if (data[documentId]) {
      document = data.documentId.data;
    } else {
      data.documentId = {
        data: "",
      };
    }
    socket.join(documentId);
    socket.emit("load-document", document.data);
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    socket.on("save-changes", (data) => {
      data.documentId = {
        data,
      };
    });
  });
});

io.listen(3001);
