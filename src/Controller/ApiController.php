<?php

namespace App\Controller;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\ButtonType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class ApiController extends AbstractController
{
    #[Route('/edit-video', name: 'edit_video', methods: ["POST"])]
    public function editVideo(Request $request, SessionInterface $session): JsonResponse
    {
        $parameters = $request->request->all();
        $videos = $session->get("videos") ?? [];

        foreach($parameters as $id => $video) {
            $videos[$id] = $video;
        }

        $session->set("videos", $videos);
        return new JsonResponse();
    }

    #[Route('/delete-video', name: 'delete_video', methods: ["POST"])]
    public function deleteVideo(Request $request, SessionInterface $session): JsonResponse
    {
        $parameters = $request->request->all();

        if ($parameters["all"] == 1) {
            $session->set("videos", []);
            return new JsonResponse();
        }

        $videos = $session->get("videos") ?? [];

        foreach($parameters["videos"] as $video) {
            unset($videos[$video]);
        }

        $session->set("videos", $videos);
        return new JsonResponse();
    }

    #[Route('/edit-hide-time', name: 'edit_hide_time', methods: ["POST"])]
    public function editHideTime(Request $request, SessionInterface $session): JsonResponse
    {
        $parameters = $request->request->all();
        $hideTime = $parameters["hideTime"];

        $session->set("hideTime", $hideTime);
        return new JsonResponse();
    }
}