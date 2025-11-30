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
        $this->players = [];
    }

    public function getId(): string
    {
        return $this->id;
    }

    /**
     * Ajoute un joueur à la salle.
     * @param Player $newPlayer
     * @return string|self L'instance de Room en cas de succès, ou une chaîne d'erreur.
     */
    public function addPlayer(Player $newPlayer): string|self
    {
        $token = $newPlayer->getToken();
        $pseudo = $newPlayer->getPseudo();

        if (empty($token) || empty($pseudo)) {
            return 'Pseudo or token is empty';
        }

        foreach ($this->players as $player) {
            if ($player->getToken() === $token) {
                return 'Already joined the room';
            }
            if (strtolower($player->getPseudo()) === strtolower($pseudo)) {
                return 'Pseudo already taken';
            }
        }

        $this->players[] = $newPlayer;

        return $this;
    }

    public function getMaster(): Player
    {
        return $this->master;
    }

    public function isMaster(string|Player $subject): bool
    {
        if (!is_string($subject)) {
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

    /**
     * Récupère un joueur par son jeton.
     */
    public function getPlayer(string $token): ?Player
    {
        foreach ($this->players as $player) {
            if ($player->getToken() === $token) {
                return $player;
            }
        }

        return null;
    }

    /**
     * Met à jour un joueur existant dans la salle.
     * @param Player $player
     * @return string|self L'instance de Room en cas de succès, ou une chaîne d'erreur.
     */
    public function setPlayer(Player $player): string|self
    {
        $found = false;
        foreach ($this->players as &$p) {
            if ($p->getToken() === $player->getToken()) {
                $p = $player;
                $found = true;
                break;
            }
        }

        if (!$found) {
            return 'Player not found in the room';
        }

        return $this;
    }

    /**
     * Retire un joueur de la salle en utilisant son jeton.
     * @param string $token
     * @return string|self L'instance de Room en cas de succès, ou une chaîne d'erreur.
     */
    public function removePlayerWithToken(string $token): string|self
    {
        $index = -1;
        foreach ($this->players as $key => $player) {
            if ($player->getToken() === $token) {
                $index = $key;
                break;
            }
        }

        if (-1 === $index) {
            return 'Player with this token is not in the room';
        }

        unset($this->players[$index]);
        $this->players = array_values($this->players);

        return $this;
    }

    /**
     * Retire un joueur de la salle en utilisant son pseudo.
     * @param string $pseudo
     * @return string La chaîne du jeton du joueur retiré, ou une chaîne d'erreur.
     */
    public function removePlayerWithPseudo(string $pseudo): string
    {
        $index = -1;
        foreach ($this->players as $key => $player) {
            if (strtolower($player->getPseudo()) === strtolower($pseudo)) {
                $index = $key;
                break;
            }
        }

        if (-1 === $index) {
            return 'This player is not in the room';
        }

        $token = $this->players[$index]->getToken();
        unset($this->players[$index]);
        $this->players = array_values($this->players);
        return $token;
    }

    public function getPlayersToken(): array
    {
        return array_map(fn(Player $player) => $player->getToken(), $this->players);
    }
}