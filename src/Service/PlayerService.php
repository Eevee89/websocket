<?php

namespace App\Service;

use App\Entity\Player;
use App\Repository\PlayerRepository;
use App\Repository\RoomRepository;
use Doctrine\ORM\EntityManagerInterface;

class PlayerService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private RoomRepository $roomRepository
    ) {}

    /**
     * Tente d'ajouter un joueur dans une salle existante.
     * @throws \Exception
     */
    public function joinRoom(?string $roomId, string $pseudo, string $token): array
    {
        if ('' === $pseudo) {
            return ['error' => 'Missing mandatory \'pseudo\' field.'];
        }

        if (empty($roomId)) {
            return ['error' => 'Room doesn\'t exist'];
        }

        $rooms = $this->roomRepository->findAll();
        foreach ($rooms as $room) {
            if ($room->getPlayer($token)) {
                return ['error' => 'Player cannot join several rooms at the same time'];
            }
        }

        $decodedId = base64_decode($roomId);
        $intId = (int) $decodedId;
        $room = $this->roomRepository->find($intId);
        if (null === $room) {
            return ['error' => 'Room doesn\'t exist'];
        }
        if ($room->isMaster($token)) {
            return ['error' => 'Master cannot join the room as player'];
        }
        if ($room->getPlayer($token)) {
            return ['error' => 'Player already in room'];
        }

        $player = new Player($token, $pseudo);
        $result = $room->addPlayer($player);

        if (is_string($result)) {
            return ['error' => $result];
        }
        $this->entityManager->persist($player);

        // --- DEBUG ---
        $uow = $this->entityManager->getUnitOfWork();
        dump('ROOM STATE:', $uow->getEntityState($room));
        // 2 = MANAGED (Ok), 4 = DETACHED (Problème !)

        dump('PLAYER STATE:', $uow->getEntityState($player));
        // 1 = NEW (Ok)

        // Est-ce que Doctrine prévoit d'insérer une nouvelle Room ?
        $scheduledInsertions = $uow->getScheduledEntityInsertions();
        foreach ($scheduledInsertions as $entity) {
            dump('SCHEDULED INSERT:', get_class($entity));
        }
        die();
        // --- FIN DEBUG ---

        $this->entityManager->flush();

        return [];
    }

    public function updateScore(Player $player, int $points): void
    {
        $player->setScore($player->getScore() + $points);
        $this->entityManager->flush();
    }

    public function toggleReady(Player $player): bool
    {
        $player->setReady(!$player->isReady());
        $this->entityManager->flush();

        return $player->isReady();
    }

    public function leaveRoom(Player $player): void
    {
        $room = $player->getRoom();
        if ($room) {
            $room->removePlayer($player);

            if ($room->getPlayers()->isEmpty()) {
                $this->entityManager->remove($room);
            }

            $this->entityManager->remove($player);
            $this->entityManager->flush();
        }
    }
}
