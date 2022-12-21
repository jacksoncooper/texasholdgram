use std::env;
use std::error;
use std::io;
use std::fs;

use holdgram_gen::graph;

fn main() -> Result<(), Box<dyn error::Error>>
{
    let argv: Vec<String> = env::args().collect();

    if argv.len() < 2 {
        return Err(Box::from("usage: cargo run --bin display -- word-list"));
    }

    let reader = io::BufReader::new(fs::File::open(&argv[1])?);
    let graph = graph::Graph::from_reader_over_ascii(reader)?;

    let out = fs::File::create("./out/graph.dot")?;
    graph.to_dot(out)?;

    let out = fs::File::create("./out/paths.txt")?;
    graph.to_paths(out, 3, (3, 7))?;

    println!("{}", graph);

    Ok(())
}
