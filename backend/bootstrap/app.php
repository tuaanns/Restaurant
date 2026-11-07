<?php

date_default_timezone_set('Asia/Ho_Chi_Minh');

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // CORS & API Middlewares
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

