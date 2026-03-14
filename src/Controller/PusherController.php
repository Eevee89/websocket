<?php

namespace App\Controller;

use Pusher\Pusher;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;


class PusherController extends AbstractController
{
    #[Route('/pusher/auth', name: 'pusher_auth', methods: ['POST'])]
    public function auth(Request $request, Pusher $pusher): JsonResponse
    {
        $session = $request->getSession();
        $userToken = $session->get('user');
        $pseudo = $session->get('pseudo');
        $roomId = $session->get('roomId');

        if (!$userToken || !$pseudo) {
            return new JsonResponse([
                'error' => 'Accès refusé : session invalide'
            ], 403);
        }

        $socketId = $request->request->get('socket_id');
        $channelName = $request->request->get('channel_name');

        if ($channelName !== "presence-room-" . $roomId) {
            return new JsonResponse([
                'error' => 'Interdit de rejoindre cette salle'
            ], 403);
        }

        $presenceData = [
            'user_id' => $userToken,
            'user_info' => [
                'pseudo' => $pseudo,
                'isMaster' => $session->get('isMaster', false),
                'color' => '#' . substr(md5($userToken), 0, 6)
            ]
        ];

        $auth = $pusher->authorizePresenceChannel(
            $channelName, 
            $socketId, 
            $presenceData['user_id'], 
            $presenceData['user_info']
        );

        return new JsonResponse(json_decode($auth));
    }
}