<?php

namespace App\Http\Controllers;

use App\User;
use Auth;
use JWTAuth;
use Hash;

use Illuminate\Http\Request;
use Tymon\JWTAuth\Exceptions\JWTException;

class ApiAuth extends Controller {
    
    function login(Request $request) {
        if(filter_var($request->input('login'), FILTER_VALIDATE_EMAIL) ) {
            $field = 'email';
        } else {
            $field = 'username';
        }

        try {
            // attempt to verify the credentials and create a token for the user
            if (!$token = JWTAuth::attempt([$field => $request->input('login'), "password" => $request->input('password')])) {
                return response()->json(['error' => 'invalid_credentials'], 401);
            }
        } catch (JWTException $e) {
            // something went wrong whilst attempting to encode the token
            return response()->json(['error' => 'could_not_create_token'], 500);
        }
        
        return response()->json(compact('token'));
    }

    function register(Request $request) {     
        
        $user = new User();
        $user->username = $request->input('username');
        $user->password = Hash::make($request->input('password'));
        $user->email    = $request->input('email');
        $saved = $user->save();

        if($saved) {
            return response()
                ->json([ "success" => true ]);
        } else {
            return response()
                ->json([ "success" => false ]);
        }       
    }
}