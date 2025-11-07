<?php

namespace App\Controller;

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
    public function login(Request $request, SessionInterface $session)
    {
        $form = $this->createFormBuilder()
            ->add('roomId', NumberType::class, [
                'label' => 'ID de partie',
                'html5' => true,
                'attr' => [
                    'min' => 0, 
                    'max' => 999999, 
                    'placeholder' => '000000',
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

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();
            $roomId = $data['roomId'];
            $pseudo = $data['pseudo'];

            $session->set("pseudo", $pseudo);
            $session->set("roomId", $roomId);

            if ($form->get('create_room')->isClicked()) {
                $session->set("isMaster", true);
            }

            if ($form->get('join_room')->isClicked()) {
                $session->set("isMaster", false);
            }

            return $this->redirectToRoute('app_dashboard', ['room' => $roomId]);
        }

        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        for ($i = 0; $i < 12; $i++) {
            $randomString .= $characters[random_int(0, 35)];
        }
        $session->set("user", $randomString);

        return $this->render('login.html.twig', [
            'form' => $form->createView(),
            'token' => $randomString
        ]);
    }

    #[Route('/game/{room}/dashboard', name: 'app_dashboard')]
    public function dashboard(int $room, SessionInterface $session)
    {
        if ($session->get("isMaster")) {
            return $this->render("back-office/dashboard.html.twig", [
                "room" => $room,
                "pseudo" => $session->get("pseudo"),
                "hide" => $session->get("hideTime") ?? 20,
                "master" => 1,
                "token" => $session->get("user"),
                "videos" => $session->get("videos") ?? []
            ]);
        }

        return $this->render("front-office/dashboard.html.twig", [
            "room" => $room,
            "pseudo" => $session->get("pseudo"),
            "hide" => $session->get("hideTime") ?? 20,
            "master" => 0,
            "token" => $session->get("user"),
            "videos" => $session->get("videos") ?? []
        ]);
    }

    #[Route('/game/{room}/', name: 'app_game')]
    public function game(int $room, SessionInterface $session)
    {
        if ($session->get("isMaster")) {
            return $this->render("back-office/game.html.twig", [
                "room" => $room,
                "hide" => $session->get("hideTime") ?? 20,
                "master" => 1,
                "token" => $session->get("user"),
                "videos" => array_values($session->get("videos") ?? [])
            ]);
        }

        return $this->render("front-office/game.html.twig", [
            "room" => $room,
            "hide" => $session->get("hideTime") ?? 20,
            "master" => 0,
            "token" => $session->get("user"),
            "videos" => array_values($session->get("videos") ?? [])
        ]);
    }
}