<?php

namespace App\Service;

use App\Entity\Player;
use App\Entity\Room;
use App\Repository\RoomRepository;
use Doctrine\ORM\EntityManagerInterface;

class RoomService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private RoomRepository $roomRepository
    ) {}

    public function createRoom(string $token, string $pseudo): array
    {
        if ('' === $pseudo) {
            return ['error' => 'Missing mandatory \'pseudo\' field.'];
        }

        $rooms = $this->roomRepository->findAll();
        foreach ($rooms as $room) {
            if ($room->isMaster($token)) {
                return ['error' => 'Already master of a room'];
            }
        }

        $master = new Player($token, $pseudo);
        $room = new Room($master);

        $this->entityManager->persist($room);
        $this->entityManager->persist($master);
        $this->entityManager->flush();

        return [
            'roomId' => base64_encode($room->getId() + 100000)
        ];
    }

    public function getRoom(string $id): ?Room
    {
        return $this->roomRepository->find(base64_decode($id) - 100000);
    }

    public function getRoomIdFromMaster(string $token): string
    {
        $rooms = $this->roomRepository->findAll();
        foreach ($rooms as $room) {
            if ($room->isMaster($token)) {
                return base64_encode($room->getId() + 100000);
            }
        }

        return '';
    }

    public function deleteRoom(string $id): void
    {
        $room = $this->roomRepository->find(base64_decode($id) - 100000);
        if (null === $room) {
            return;
        }

        $this->entityManager->remove($room);
        $this->entityManager->flush();
    }

    public function saveRoom(Room $room): void
    {
        $this->entityManager->persist($room);
        $this->entityManager->flush();
    }
}
