<?php

namespace App\Controller;

use App\Repository\PlayerRepository;
use App\Service\RoomService;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class AppController extends AbstractController
{
    #[Route('/', name: 'app_main')]
    public function login(
        Request $request, 
        SessionInterface $session,
        RoomService $roomService,
        string $pusherClientKey,
        PlayerRepository $repository
    ) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        for ($i = 0; $i < 12; $i++) {
            $randomString .= $characters[random_int(0, 35)];
        }

        $token = $session->get('user');
        $form = $this->createFormBuilder()
            ->add('roomId', TextType::class, [
                'label' => 'ID de partie',
                'attr' => [
                    'placeholder' => 'MTAwMDA1',
                    'class' => 'form-control input--modific'
                ],
                'required' => false,
                'constraints' => [
                    new NotBlank(['groups' => ['join'], 'message' => 'L\'ID de partie est obligatoire pour rejoindre.']),
                ],
            ])
            ->add('pseudo', TextType::class, [
                'label' => 'Pseudo',
                'attr' => [
                    'placeholder' => 'Pseudo',
                    'class' => 'form-control input--modific'
                ],
                'required' => true,
                'constraints' => [
                    new NotBlank(),
                    new Length(['min' => 2, 'max' => 50]),
                ],
            ])
            ->add('create_room', SubmitType::class, [
                'label' => 'Create room',
                'attr' => ['class' => 'btn btn-secondary form__button',],
                'validation_groups' => ['Default'], 
            ])
            ->add('join_room', SubmitType::class, [
                'label' => 'Join room',
                'attr' => ['class' => 'btn btn-secondary form__button',],
                'validation_groups' => ['join', 'Default'],
            ])
            ->setMethod('POST')
            ->getForm();

        $form->handleRequest($request);

        if ($token && $repository->findByToken($token) && $form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();
            $roomId = $data['roomId'];
            $pseudo = $data['pseudo'];

            $session->set("pseudo", $pseudo);

            if ($form->get('create_room')->isClicked()) {
                $roomId = $roomService->getRoomIdFromMaster($token);
                $session->set("isMaster", true);
            }

            if ($form->get('join_room')->isClicked()) {
                $session->set("isMaster", false);
            }

            $session->set("roomId", $roomId);
            return $this->redirectToRoute('app_dashboard', ['room' => $roomId]);
        }

        $session->set("user", $randomString);

        return $this->render('login.html.twig', [
            'form' => $form->createView(),
            'token' => $randomString,
            'pusher' => [
                'key' => $pusherClientKey,
            ]
        ]);
    }

    #[Route('/game/{room}/dashboard', name: 'app_dashboard')]
    public function dashboard(string $room, SessionInterface $session, string $pusherClientKey, PlayerRepository $repository)
    {
        $token = $session->get("user");
        if (!$repository->findByToken($token)) {
            $session->set('user', null);
            return $this->redirectToRoute('/');
        }

        $template = $session->get("isMaster") 
            ? "back-office/dashboard.html.twig"
            : "front-office/dashboard.html.twig"
        ;

        return $this->render($template, [
            "room" => $room,
            "pseudo" => $session->get("pseudo"),
            "hide" => $session->get("hideTime") ?? 20,
            "master" => $session->get("isMaster") ? 1 : 0,
            "token" => $session->get("user"),
            "videos" => $session->get("videos") ?? [],
            'pusher' => [
                'key' => $pusherClientKey,
            ]
        ]);
    }

    #[Route('/game/{room}/', name: 'app_game')]
    public function game(string $room, SessionInterface $session, string $pusherClientKey, PlayerRepository $repository)
    {
        $token = $session->get("user");
        if (!$repository->findByToken($token)) {
            $session->set('user', null);
            return $this->redirectToRoute('/');
        }

        $template = $session->get("isMaster")
            ? "back-office/game.html.twig"
            : "front-office/game.html.twig";

        return $this->render($template, [
            "room" => $room,
            "hide" => $session->get("hideTime") ?? 20,
            "master" => $session->get("isMaster") ? 1 : 0,
            "videos" => array_values($session->get("videos") ?? []),
            'pusher' => [
                'key' => $pusherClientKey,
            ]
        ]);
    }
}