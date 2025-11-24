<?php

namespace App\Entity;

class Room
{
    private string $id;

    /** @var Player[] $players */
    private array $players;

    private Player $master;

    public function __construct(string $id, Player $master)
    {
        $this->master = $master;
        $this->id = $id;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function addPlayer(Player $newPlayer): string
    {
        $token = $newPlayer->getToken();
        $pseudo = $newPlayer->getPseudo();

        if (!$token || !$pseudo) {
            return 'Pseudo or token is empty';
        }

        foreach($this->players as $player) {
            if ($player->getToken() === $token) {
                return 'Already joined the room';
            }
            if ($player->getPseudo() === $pseudo) {
                return 'Pseudo already taken';
            }
        }

        $this->players[] = $newPlayer;

        return '';
    }

    public function getMaster(): Player
    {
        return $this->master;
    }

    public function isMaster(string|Player $subject): bool
    {
        if ($subject instanceof Player) {
            return $this->isMaster($subject->getToken());
        }

        return $this->master->getToken() === $subject;
    }

    public function hasPlayer(string $token): bool
    {
        foreach ($this->players as $player) {
            if ($player->getToken() === $token) {
                return true;
            }
        }

        return false;
    }

    public function getPlayer(string $player): Player
    {
        return array_find($this->players, fn ($player) => $player->getToken() === $player);
    }

    public function setPlayer(Player $player): self
    {
        foreach ($this->players as &$p) {
            if ($p->getToken() === $player->getToken()) {
                $p = $player;
                return $this;
            }
        }

        return $this;
    }

    public function removePlayerWithToken(string $token): self
    {
        $index = -1;
        foreach ($this->players as $key => $player) {
            if ($player->getToken() === $token) {
                $index = $key;
                break;
            }
        }

        if (-1 === $index) {
            return $this;
        }

        $this->players[$index];
        return $this;
    }

    public function removePlayerWithPseudo(string $pseudo): self
    {
        $index = -1;
        foreach ($this->players as $key => $player) {
            if ($player->getPseudo() === $pseudo) {
                $index = $key;
                break;
            }
        }

        if (-1 === $index) {
            return $this;
        }

        $this->players[$index];
        return $this;
    }

    public function getPlayersToken(): array
    {
        return array_map(fn ($player) => $player->getToken(), $this->players);
    }
}