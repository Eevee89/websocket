<?php

namespace App\Websocket;

class ResponseComponent
{
    public static function error(string $route, string $message, array $datas = []): string
    {
        return json_encode([
            'route' => $route,
            'success' => false,
            'message' => $message,
            'datas' => $datas  
        ]);
    }

    public static function success(string $route, array $datas = [], string $message = ""): string
    {
        return json_encode([
            'route' => $route,
            'success' => true,
            'message' => $message,
            'datas' => $datas  
        ]);
    }
}