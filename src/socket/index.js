let onlineUsers = []
export const newConnectionHandler = (newClient) => {
  console.log("NEW CONNECTION -----", newClient.id)

  // 1. Emit a "welcome" event to the connected client
  newClient.emit("welcome", { message: `Hello ${newClient.id}` })

  // 2. Listen to an event emitted by the FE called "setUsername", this event is going to contain the username in the payload
  newClient.on("createAndSetUsername", (payload) => {
    console.log(payload)
    // 2.1 Whenever we receive the username, we keep track of that together with the socket.id
    onlineUsers.push({ username: payload.username, socketId: newClient.id })
    newClient.emit("loggedIn", onlineUsers)

    // 2.3 We have also to inform everybody (but not the sender) of the new user which just joined
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers)
  })
  //  send the whole chat history
  // newClient.emit("chatHistory", chatHistory)

  newClient.on("sendMessage", (message) => {
    console.log("NEW MESSAGE:", message)
    // 3.1 Whenever we receive that new message we have to propagate that message to everybody but not sender
    newClient.broadcast.emit("newMessage", message)
  })

  newClient.on("disconnect", () => {
    // 4.1 Server shall update the list of onlineUsers by removing the one that has disconnected
    onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id)
    // 4.2 Let's communicate the updated list all the remaining clients
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers)
  })
}
