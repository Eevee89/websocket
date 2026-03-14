<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Service\RoomService;
use App\Service\PlayerService;
use Pusher\Pusher;

#[Route('/room', name: 'room_')]
class RoomController extends AbstractController 
{
    public function __construct(
        private RoomService $roomService,
        private PlayerService $playerService,
    ) {}

    #[Route('/create', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $session = $request->getSession();
        $userToken = $session->get('user');

        $data = $request->request->all();
        $pseudo = $data['pseudo'] ?? '';

        $result = $this->roomService->createRoom($userToken, $pseudo);

        if (isset($result['error'])) {
            return $this->json([
                'success' => false, 
                'message' => $result['error']
            ], 400);
        }

        $roomId = $result['roomId'];

        $session->set('pseudo', $pseudo);
        $session->set('roomId', $roomId);
        $session->set('isMaster', true);

        return $this->json([
            'success' => true
        ]);
    }

    #[Route('/join', name: 'join', methods: ['POST'])]
    public function join(Request $request): JsonResponse
    {
        $session = $request->getSession();
        $userToken = $session->get('user');

        $data = $request->request->all();
        $roomId = $data['room'] ?? null;
        $pseudo = $data['pseudo'] ?? '';

        $check = $this->playerService->joinRoom($roomId, $pseudo, $userToken);

        if (isset($check['error'])) {
            return $this->json([
                'success' => false, 
                'message' => $check['error']
            ], 400);
        }

        $session->set('pseudo', $pseudo);
        $session->set('roomId', $roomId);
        $session->set('isMaster', false);

        return $this->json(['success' => true]);
    }

    #[Route('/{id}/kick-out', name: 'kick_out', methods: ['POST'])]
    public function kickOut(
        string $id,
        Request $request,
        Pusher $pusher
    ): JsonResponse {
        $session = $request->getSession();
        $masterToken = $session->get('user');

        $data = json_decode($request->getContent(), true);
        $targetPseudo = $data['player'] ?? null;

        $room = $this->roomService->getRoom($id);
        if (!$room) {
            return $this->json(['success' => false, 'message' => 'The room doesn\'t exist'], 404);
        }

        if (!$room->isMaster($masterToken)) {
            return $this->json(['success' => false, 'message' => 'Only master can kick players'], 403);
        }

        $playerToken = $room->removePlayerByPseudo($targetPseudo);
        $this->roomService->saveRoom($room);

        $pusher->trigger("presence-room-$id", 'player-kicked', [
            'pseudo' => $targetPseudo,
            'token'  => $playerToken
        ]);

        return $this->json(['success' => true]);
    }

    #[Route('/{id}/ready', name: 'player_ready', methods: ['POST'])]
    public function setReady(
        string $id,
        Request $request,
        Pusher $pusher
    ): JsonResponse {
        $session = $request->getSession();
        $playerToken = $session->get('user');

        $data = json_decode($request->getContent(), true);

        if (!isset($data["team"])) {
            return $this->json([
                'success' => false, 
                'message' => 'Missing mandatory \'team\' field.'
            ], 400);
        }
        if (empty($data["color"])) {
            return $this->json([
                'success' => false, 
                'message' => 'Missing mandatory \'color\' field.'
            ], 400);
        }

        $room = $this->roomService->getRoom($id);
        if (!$room) {
            return $this->json([
                'success' => false, 
                'message' => 'The room doesn\'t exist'
            ], 404);
        }

        if ($room->isMaster($playerToken)) {
            return $this->json([
                'success' => false, 
                'message' => 'Master cannot mark as ready'
            ], 403);
        }

        if (!$room->getPlayer($playerToken)) {
            return $this->json([
                'success' => false, 
                'message' => 'Not in the room'
            ], 403);
        }

        $player = $room->getPlayer($playerToken);
        $player->setTeam($data["team"] ?? "");
        $player->setColor($data["color"]);
        $player->setReady(true);

        $room->setPlayer($player);
        $this->roomService->saveRoom($room);

        $pusher->trigger("presence-room-$id", 'player-ready', [
            'token' => $playerToken,
            'pseudo' => $player->getPseudo(),
            'team' => $player->getTeam(),
            'color' => $player->getColor(),
            'isReady' => true
        ]);

        return $this->json(['success' => true]);
    }
}