use std::collections::BTreeSet;

type Signature = String;

pub fn signature(word: &String) -> Signature
{
    let mut symbols: Vec<char> = word.chars().collect();
    symbols.sort();
    String::from_iter(symbols.iter())
}

/// A class of anagrams.
/// Two anagrams are in the same class if one can be rearranged to form the other.
pub struct Class
{
    pub signature: Signature,
    pub members: BTreeSet<String>,
}
