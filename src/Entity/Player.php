<?php

namespace App\Entity;

class Player
{
    private int $id;
    private string $token;
    private string $pseudo;
    private string $team;
    private string $color = '#000000';
    private bool $ready;
    private bool $master;
    private int $score;
    private int $room;

    public function __construct(string $token, string $pseudo)
    {
        $this->token = $token;
        $this->pseudo = $pseudo;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function getPseudo(): string
    {
        return $this->pseudo;
    }

    public function getTeam(): string
    {
        return $this->team;
    }

    public function setTeam(string $team): static
    {
        $this->team = $team;

        return $this;
    }

    public function getColor(): string
    {
        return $this->color;
    }

    public function setColor(string $color): static
    {
        $this->color = $color;

        return $this;
    }

    public function isReady(): bool
    {
        return $this->ready;
    }

    public function setReady(bool $ready): static
    {
        $this->ready = $ready;

        return $this;
    }

    public function isMaster(): bool
    {
        return $this->master;
    }

    public function setMaster(bool $master): static
    {
        $this->master = $master;

        return $this;
    }

    public function getScore(): int
    {
        return $this->score;
    }

    public function setScore(int $score): static
    {
        $this->score = $score;

        return $this;
    }

    public function getRoom(): int
    {
        return $this->room;
    }

    public function setRoom(int $room): static
    {
        $this->room = $room;

        return $this;
    }
}
