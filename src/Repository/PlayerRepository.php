<?php

namespace App\Repository;

use App\Entity\Player;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Player>
 *
 * @method Player|null find($id, $lockMode = null, $lockVersion = null)
 * @method Player|null findOneBy(array $criteria, array $orderBy = null)
 * @method Player[]    findAll()
 * @method Player[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PlayerRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Player::class);
    }

    /**
     * Trouve un joueur par son token unique.
     */
    public function findByToken(string $token): ?Player
    {
        return $this->findOneBy(['token' => $token]);
    }

    /**
     * Récupère tous les joueurs d'une équipe spécifique dans une salle.
     */
    public function findByTeam(string $roomId, string $teamName): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.room = :roomId')
            ->andWhere('p.team = :team')
            ->setParameter('roomId', $roomId)
            ->setParameter('team', $teamName)
            ->getQuery()
            ->getResult();
    }
}
