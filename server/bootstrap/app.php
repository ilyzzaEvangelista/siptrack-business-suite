<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Token-based Sanctum auth (Bearer). Do not enable statefulApi()
        // unless the SPA uses cookie + CSRF (/sanctum/csrf-cookie) flow.
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
