<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\Server\IoServer;
use React\Socket\SocketServer as SocketServer;
use React\EventLoop\Loop;

use App\Websocket\MasterComponent;

#[AsCommand(
    name: 'app:websocket:start',
    description: 'Starts the application websocket server.',
    aliases: ['a:w:s']
)]
class Websocket extends Command
{
    protected static $defaultName = 'app:websocket:start';

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $host = '127.0.0.1';
        $port = 9000;
        
        $masterComponent = new MasterComponent(); 
        $wsServer = new WsServer($masterComponent);
        $httpServer = new HttpServer($wsServer);

        $loop = Loop::get();
        $socket = new SocketServer("{$host}:{$port}", [
            $loop
        ]);
        $server = new IoServer($httpServer, $socket, $loop);

        $io->success("Ratchet server listening on ws://{$host}:{$port}");

        $server->run();

        return Command::SUCCESS; 
    }
}