use std::collections::{BTreeMap, BTreeSet, HashMap, HashSet, VecDeque};
use std::error;
use std::fmt;
use std::io::{self, Write};
use rand::seq::SliceRandom;

use crate::anagram::{Class, signature};

/// The label of an anagram class.
type Label = usize;

/// A word over an alphabet.
type Word = String;

struct Edge
{
    to: Label,
    symbol: char,
}

pub struct Graph
{
    /// Each anagram is a string over an alphabet.
    alphabet: HashSet<char>,

    /// The anagram class to which a word belongs.
    to_label: HashMap<Word, Label>,

    /// The class to which a label maps.
    to_class: Vec<Class>,

    /// The anagram classes to which an anagram class is adjacent. An anagram class `A` is adjacent
    /// to another `B` if adding exactly one symbol to `A` produces `B`.
    adjacent: Vec<Vec<Edge>>,
}

impl Graph
{
    pub fn from_reader_over_ascii<R: io::BufRead>(reader: R) -> Result<Graph, Box<dyn error::Error>> {
        let mut graph = Graph::new_over_ascii();

        for word in reader.lines() {
            graph.add_word(word?)?;
        }

        graph.compute_edges();

        assert_eq!(graph.to_label.len(), graph.to_class.len());
        assert_eq!(graph.to_class.len(), graph.adjacent.len());

        Ok(graph)
    }

    fn new_over_ascii() -> Graph {
        Graph {
            to_label: HashMap::new(),       // Signature -> Label
            to_class: Vec::new(),           // Label -> Class
            adjacent: Vec::new(),           // Label -> HashSet<Label>
            alphabet: ('a'..='z').collect()
        }
    }

    fn number_of_classes(&self) -> usize {
        return self.to_class.len()
    }

    fn add_word(&mut self, word: String) -> Result<(), Error> {
        for symbol in word.chars() {
            if !self.alphabet.contains(&symbol) {
                return Err(Error {
                    message: format!("symbol '{}' not in alphabet", symbol)
                });
            }
        }

        let sig = &signature(&word);
        let maybe_label = self.to_label.get(sig);

        match maybe_label {
            Some(&label) => {
                self.to_class[label].members.insert(word);
            },
            None => {
                let label = self.to_class.len();

                let new_class = Class {
                    signature: sig.clone(),
                    members: BTreeSet::from([word.clone()])
                };

                self.to_class.push(new_class);

                // Associate the anagram with its anagram class.
                self.to_label.insert(sig.clone(), label);
            }
        }

        Ok(())
    }

    fn compute_edges(&mut self) {
        for label in 0..self.number_of_classes() {
                self.adjacent.push(self.adjacencies(label));
        }
    }

    fn adjacencies(&self, label: Label) -> Vec<Edge> {
        let sig = &self.to_class[label].signature;

        let mut found = Vec::new();

        // TODO: Whew, this is slow!
        for &symbol in &self.alphabet {
            let mut new_sig = sig.clone();
            new_sig.push(symbol);
            let new_sig = signature(&new_sig);

            if let Some(&label) = self.to_label.get(&new_sig) {
                found.push(Edge { to: label, symbol });
            }
        }

        found
    }

    fn average_degree(&self) -> f64 {
        let degree: f64 = self.adjacent.iter().map(|adjacent| adjacent.len() as f64).sum();
        degree / self.number_of_classes() as f64
    }

    fn average_class_size(&self) -> f64 {
        let degree: f64 = self.to_class.iter().map(|class| class.members.len() as f64).sum();
        degree / self.number_of_classes() as f64
    }

    fn classes_by_length(&self) -> BTreeMap<usize, HashSet<Label>> {
        let mut found: BTreeMap<usize, HashSet<Label>> = BTreeMap::new();

        for (label, class) in self.to_class.iter().enumerate() {
            let size = class.signature.len();
            found.entry(size).or_default().insert(label);
        }

        found
    }

    fn reachability(&self, class_length: usize) -> BTreeMap<usize, usize> {
        let mut reachable = BTreeMap::new();

        let by_length = self.classes_by_length();

        let source_classes = match by_length.get(&class_length) {
            Some(classes) => classes,
            None => return reachable,
        };

        for &source in source_classes {
            let mut seen = HashSet::from([source]);
            let mut discovered = VecDeque::from_iter([source]);

            while !discovered.is_empty() {
                let label = discovered.pop_front().unwrap();
                let class = &self.to_class[label];
                *reachable.entry(class.signature.len()).or_default() += 1;

                for &Edge { to, .. } in &self.adjacent[label] {
                    discovered.push_back(to);
                    seen.insert(to);
                }
            }
        }

        reachable
    }

    pub fn to_paths<W: io::Write>(
        &self, writer: W,
        class_length: usize, length_bounds: (usize, usize)) -> io::Result<()>
    {
        let mut writer = io::BufWriter::new(writer);

        let by_length = self.classes_by_length();

        let source_classes = match by_length.get(&class_length) {
            Some(classes) => classes,
            None => return Ok(()),
        };

        let mut path: Vec<(Label, Option<char>)> = Vec::new();
        let mut paths = Vec::new();

        fn go(
            graph: &Graph, paths: &mut Vec<String>,
            path: &mut Vec<(Label, Option<char>)>,
            source: Label,
            length_bounds: (usize, usize)) -> ()
        {
            let adjacent = &graph.adjacent[source];

            if adjacent.is_empty() && length_bounds.0 <= (1 + path.len()) && (1 + path.len()) <= length_bounds.1 {
                path.push((source, None));

                let mut readable_path = Vec::new();

                for &(label, maybe_symbol) in path.iter() {
                    let class = &graph.to_class[label];

                    let members = class.members.iter()
                        .map(|word| word.as_str())
                        .collect::<Vec<&str>>().join(", ");

                    if let Some(symbol) = maybe_symbol {
                        readable_path.push(format!("{{{}}} + {}", members, symbol));
                    } else {
                        readable_path.push(format!("{{{}}}", members));
                    }
                }

                paths.push(format!("{}", readable_path.join(" -> ")));

                path.pop();
            }

            for edge in adjacent {
                path.push((source, Some(edge.symbol)));
                go(graph, paths, path, edge.to, length_bounds);
                path.pop();
            }
        }

        for &source in source_classes {
            go(self, &mut paths, &mut path, source, length_bounds);
        }

        paths.shuffle(&mut rand::thread_rng());

        for path in paths {
            writer.write(path.as_bytes())?;
            writer.write("\n".as_bytes())?;
        }

        writer.flush()?;
        Ok(())
    }

    pub fn to_dot<W: io::Write>(&self, writer: W) -> io::Result<()> {
        let mut writer = io::BufWriter::new(writer);

        writer.write(b"strict digraph {\n")?;

        for label in 0..self.to_class.len() {
            let signature = &self.to_class[label].signature;
            writer.write(format!(
                "  {} [label=\"{}\"];\n",
                label, signature
            ).as_bytes())?;
        }

        for label in 0..self.adjacent.len() {
            for edge in &self.adjacent[label] {
                writer.write(format!(
                    "  {} -> {} [label=\"{}\"];\n",
                    label, edge.to, edge.symbol
                ).as_bytes())?;
            }
        }

        writer.write(b"}\n")?;

        writer.flush()?;
        Ok(())
    }
}

impl fmt::Display for Graph
{
    fn fmt(&self, f: &mut fmt::Formatter) -> Result<(), fmt::Error> {
        writeln!(f, "👉 overview")?;
        writeln!(f, "  - number of classes: {:}", self.to_class.len())?;
        writeln!(f, "  - average class size: {:.2}", self.average_class_size())?;
        writeln!(f, "  - average degree: {:.2}", self.average_degree())?;

        writeln!(f, "")?;

        writeln!(f, "👉 anagram classes")?;
        for (length, labels) in self.classes_by_length() {
            let count = labels.len();
            let sample_signature = &self.to_class[*labels.iter().next().unwrap()].signature;
            writeln!(f, "{:6} of length {:2} (e.g. {})", count, length, sample_signature)?;
        }

        writeln!(f, "")?;

        // TODO: Clean this up. There's no guarantee this won't panic if there is no anagram class
        // of length three.

        let source_length = 3;
        let source_count = self.classes_by_length().get(&source_length).unwrap().len();

        writeln!(f, "👉 reachability from class length {}", source_length)?;
        for (length, count) in self.reachability(source_length) {
            let average = count as f64 / source_count as f64;
            writeln!(f, "{:6} of length {:2} (avg. {:.2})", count, length, average)?;
        }

        writeln!(f, "")?;
        write!(f, "(end)")
    }
}

#[derive(Debug)]
struct Error {
    message: String,
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> Result<(), fmt::Error> {
        write!(f, "{}", self.message)
    }
}

impl error::Error for Error { }
