package basics;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import javax.json.JsonString;
import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/game", encoders = {FigureEncoder.class}, decoders = {FigureDecoder.class})
public class Endpoint1 {

    private static ArrayList<Session> peers = new ArrayList<>(new HashSet<Session>());

    @OnOpen
    public void onOpen(Session peer) {
        peers.add(peer);
    }

    @OnClose
    public void onClose(Session peer) {
        peers.remove(peer);
    }

    @OnMessage
    public void broadcastFigure(Figure figure, Session session) throws IOException, EncodeException {
        JsonString str = figure.getJson().getJsonString("item");
        if (str.getString().equals("ball")) {
            for (int i = 0; i < 2; i++) {
                if (peers.get(0).equals(session)) {
                    peers.get(1).getBasicRemote().sendObject(figure);
                }
            }
        }

        if (str.getString().equals("player")) {
            for (int i = 0; i < 2; i++) {
                if (peers.get(0).equals(session)) {
                    peers.get(1).getBasicRemote().sendObject(figure);
                }
            }
        }

        if (str.getString().equals("ai")) {
            for (int i = 0; i < 2; i++) {
                if (peers.get(1).equals(session)) {
                    peers.get(0).getBasicRemote().sendObject(figure);
                }
            }
        }
    }

}
