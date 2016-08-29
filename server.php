<?php
/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
$scriptInvokedFromCli =
    isset($_SERVER['argv'][0]) && $_SERVER['argv'][0] === 'server.php';

if($scriptInvokedFromCli) {
    $port = getenv('PORT');
    if (empty($port)) {
        $port = "3002";
    }

    echo 'starting server on port '. $port . PHP_EOL;
    exec('php -S localhost:'. $port . ' -t ./ server.php');
} else {
    return routeRequest();
}

function routeRequest()
{
    $ladder = file_get_contents('./src/models/ladder.json');
    $uri = $_SERVER['REQUEST_URI'];
    if ($uri == '/') {
        echo file_get_contents('./index.html');
    } elseif (preg_match('/\/api\/ladder(\?.*)?/', $uri)) {
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $commentsDecoded = json_decode($ladder, true);
            $commentsDecoded[] = [
                'id'      => round(microtime(true) * 1000),
                'name'  => $_POST['name'],
                'clicks'    => $_POST['clicks']
            ];

            $ladder = json_encode($commentsDecoded, JSON_PRETTY_PRINT);
            file_put_contents('src/models/ladder.json', $ladder);
        }
        header('Content-Type: application/json');
        header('Cache-Control: no-cache');
        header('Access-Control-Allow-Origin: *');
        echo $ladder;
    } else {
        return false;
    }
}
