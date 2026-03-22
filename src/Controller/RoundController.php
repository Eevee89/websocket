<?php

namespace App\Controller;

use App\Service\PlayerService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Service\RoomService;
use Pusher\Pusher;

#[Route('/round', name: 'round_')]
class RoundController extends AbstractController
{
    public function __construct(
        private RoomService $roomService,
        private PlayerService $playerService
    ) {}

    #[Route('/{id}/ready', name: 'ready', methods: ['POST'])]
    public function setReady(
        string $id,
        Request $request,
        Pusher $pusher
    ): JsonResponse {
        $session = $request->getSession();
        $playerToken = $session->get('user');

        $data = $request->request->all();
        $round = $data['round'];

        $room = $this->roomService->getRoom($id);
        if (!$room) {
            return $this->json([
                'success' => false,
                'message' => 'The room doesn\'t exist'
            ], 404);
        }

        if (!$room->isMaster($playerToken)) {
            return $this->json([
                'success' => false,
                'message' => 'Player cannot mark round as ready'
            ], 403);
        }

        $videos = array_values($session->get("videos") ?? []);
        $pusher->trigger("presence-room-$id", 'round-ready', [
            'videoId' => count($videos) ? $videos[$round] : '',
            'count' => count($videos),
            'hideTime' => $session->get("hideTime") ?? 20
        ]);

        return $this->json(['success' => true]);
    }

    #[Route('/{id}/player-ready', name: 'player_ack_ready', methods: ['POST'])]
    public function ackReady(
        string $id,
        Request $request,
        Pusher $pusher
    ): JsonResponse {
        $session = $request->getSession();
        $playerToken = $session->get('user');

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

        $pusher->trigger("presence-room-$id", 'player-ack-ready', [
            'token' => $playerToken,
            'pseudo' => $player->getPseudo()
        ]);

        return $this->json(['success' => true]);
    }

    #[Route('/{id}/launch', name: 'launch', methods: ['POST'])]
    public function launch(
        string $id,
        Request $request,
        Pusher $pusher
    ): JsonResponse {
        $session = $request->getSession();
        $playerToken = $session->get('user');

        $room = $this->roomService->getRoom($id);
        if (!$room) {
            return $this->json([
                'success' => false,
                'message' => 'The room doesn\'t exist'
            ], 404);
        }

        if (!$room->isMaster($playerToken)) {
            return $this->json([
                'success' => false,
                'message' => 'Player cannot launch the round'
            ], 403);
        }

        $pusher->trigger("presence-room-$id", 'launch', []);

        return $this->json(['success' => true]);
    }

    #[Route('/{id}/player-finish', name: 'player_ack_finish', methods: ['POST'])]
    public function ackFinish(
        string $id,
        Request $request,
        Pusher $pusher
    ): JsonResponse {
        $session = $request->getSession();
        $playerToken = $session->get('user');

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

        $pusher->trigger("presence-room-$id", 'player-ack-finish', [
            'token' => $playerToken,
            'pseudo' => $player->getPseudo()
        ]);

        return $this->json(['success' => true]);
    }

    #[Route('/{id}/buzz', name: 'player_buzzed', methods: ['POST'])]
    public function buzz(
        string $id,
        Request $request,
        Pusher $pusher
    ): JsonResponse {
        $session = $request->getSession();
        $playerToken = $session->get('user');

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
                'message' => 'Master cannot buzzed'
            ], 403);
        }

        if (!$room->getPlayer($playerToken)) {
            return $this->json([
                'success' => false,
                'message' => 'Not in the room'
            ], 403);
        }

        $player = $room->getPlayer($playerToken);

        $pusher->trigger("presence-room-$id", 'player-buzzed', [
            'token' => $playerToken,
            'pseudo' => $player->getPseudo()
        ]);

        return $this->json(['success' => true]);
    }

    #[Route('/{id}/valid', name: 'valid', methods: ['POST'])]
    public function valid(
        string $id,
        Request $request,
        Pusher $pusher
    ): JsonResponse {
        $session = $request->getSession();
        $playerToken = $session->get('user');

        $data = $request->request->all();
        $buzzer = $data['buzzer'];

        $room = $this->roomService->getRoom($id);
        if (!$room) {
            return $this->json([
                'success' => false,
                'message' => 'The room doesn\'t exist'
            ], 404);
        }

        if (!$room->isMaster($playerToken)) {
            return $this->json([
                'success' => false,
                'message' => 'Player cannot mark as valid or not'
            ], 403);
        }

        $player = $room->getPlayer($buzzer);
        if ($player) {
            $this->playerService->updateScore($player, intval($data['points']));
        }

        $pusher->trigger("presence-room-$id", 'validation', [
            'token' => $buzzer,
            'isValid' => $data['isValid'],
        ]);

        return $this->json(['success' => true]);
    }
}
