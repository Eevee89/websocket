<?php

namespace App\Entity;

use App\Repository\RoomRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RoomRepository::class)]
class Room
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column]
    private ?int $id = null;

    /** @var Collection<int, Player> */
    #[ORM\OneToMany(mappedBy: 'room', targetEntity: Player::class, orphanRemoval: true)]
    private Collection $players;

    #[ORM\OneToOne(targetEntity: Player::class)]
    #[ORM\JoinColumn(name: "master_id", referencedColumnName: "id", nullable: true)]
    private ?Player $master = null;

    public function __construct(Player $master)
    {
        $this->master = $master;
        $this->players = new ArrayCollection();
        
        $this->addPlayer($master);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMaster(): ?Player
    {
        return $this->master;
    }

    /**
     * @return Collection<int, Player>
     */
    public function getPlayers(): Collection
    {
        return $this->players;
    }

    public function addPlayer(Player $player): string|self
    {
        if (empty($player->getToken()) || empty($player->getPseudo())) {
            return 'Pseudo or token is empty';
        }

        foreach ($this->players as $p) {
            if ($p->getToken() === $player->getToken()) {
                return 'Already joined the room';
            }
            if (strtolower($p->getPseudo()) === strtolower($player->getPseudo())) {
                return 'Pseudo already taken';
            }
        }

        if (!$this->players->contains($player)) {
            $this->players->add($player);
            $player->setRoom($this);
        }

        return $this;
    }

    public function removePlayer(Player $player): string
    {
        if ($this->players->removeElement($player)) {
            if ($player->getRoom() === $this) {
                $player->setRoom(null);
                return $player->getId();
            }
        }
        return '';
    }


    public function removePlayerByPseudo(string $pseudo): string
    {
        $player = $this->getPlayerByPseudo($pseudo);
        if (!$player) {
            return '';
        }

        return $this->removePlayer($player);
    }

    public function isMaster(string|Player $subject): bool
    {
        $token = ($subject instanceof Player) ? $subject->getToken() : $subject;
        return $this->master !== null && $this->master->getToken() === $token;
    }

    public function getPlayer(string $token): ?Player
    {
        foreach ($this->players as $player) {
            if ($player->getToken() === $token) return $player;
        }
        return null;
    }

    public function getPlayerByPseudo(string $pseudo): ?Player
    {
        foreach ($this->players as $player) {
            if ($player->getPseudo() === $pseudo) return $player;
        }
        return null;
    }

    public function getPlayersToken(): array
    {
        return $this->players->map(fn(Player $p) => $p->getToken())->toArray();
    }

    public function setPlayer(Player $player): self
    {
        foreach ($this->players as $key => $existingPlayer) {
            if ($existingPlayer->getToken() === $player->getToken()) {
                $this->players[$key] = $player;
                break;
            }
        }

        return $this;
    }
}
